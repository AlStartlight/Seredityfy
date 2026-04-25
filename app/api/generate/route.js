import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { checkUserPermissions, getVisibilityForUser, SUBSCRIPTION_LIMITS, calculateCreditCost } from '@/src/lib/services/visibility';
import { auth } from '../../../auth';
import { pushJob } from '@/src/lib/queue/upstashQueue';

function triggerWorker(baseUrl) {
  const workerUrl = `${baseUrl}/api/queue/worker`;
  fetch(workerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WORKER_SECRET}`,
    },
  }).catch(err => console.warn('[Generate] Worker trigger failed:', err.message));
}

export async function POST(request) {
  try {
    const session = await auth();
    
    let userId = null;
    let isAuthenticated = false;

    if (session?.user?.id) {
      userId = session.user.id;
      isAuthenticated = true;
    }

    const body = await request.json();
    const { 
      prompt, 
      model = 'seredityfy-v2',
      generationMode = 'HYBRID',
      width = 1280,
      height = 720,
      steps = 30,
      guidanceScale = 8.5,
      negativePrompt = null,
      visibility: requestedVisibility = 'PUBLIC',
      referenceImage = null,
      strength = 0.7,
    } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: 'Prompt too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    if (isAuthenticated) {
      const permissions = await checkUserPermissions(userId, width, height, model);

      if (!permissions.canGenerate) {
        // Calculate days until next reset based on actual subscription
        let daysUntilReset = 7;
        if (permissions.nextResetDate) {
          const resetTime = new Date(permissions.nextResetDate).getTime();
          const now = Date.now();
          daysUntilReset = Math.max(0, Math.ceil((resetTime - now) / (1000 * 60 * 60 * 24)));
        }
        return NextResponse.json(
          { 
            error: `Weekly credit limit reached (${permissions.credits} credits/week). Next reset in ${daysUntilReset} days.`,
            plan: permissions.plan,
            availableCredits: permissions.availableCredits,
            creditCost: permissions.creditCost,
            nextResetDate: permissions.nextResetDate,
            upgradeUrl: '/admin/billing',
          },
          { status: 429 }
        );
      }

      if (width > permissions.limits.maxWidth || height > permissions.limits.maxHeight) {
        return NextResponse.json(
          { 
            error: `Maximum resolution for your plan is ${permissions.limits.maxWidth}x${permissions.limits.maxHeight}. Upgrade to access higher resolutions.`,
            upgradeUrl: '/admin/billing',
          },
          { status: 403 }
        );
      }
    }

    const visibility = await getVisibilityForUser(userId, requestedVisibility);

    const imageData = {
      prompt: prompt.trim(),
      model,
      generationMode,
      status: 'PENDING',
      visibility,
      width,
      height,
      steps,
      guidanceScale,
      negativePrompt,
      metadata: {
        requestedAt: new Date().toISOString(),
        isAuthenticated,
        hasReferenceImage: !!referenceImage,
        referenceStrength: strength,
      },
    };

    if (userId) {
      imageData.userId = userId;
    }

    const creditCost = calculateCreditCost(width, height, model);

    const image = await prisma.generatedImage.create({
      data: imageData,
    });

    if (userId) {
      console.log('[Generate] Processing credit for user:', userId, 'cost:', creditCost);
      
      let subscription = await prisma.subscription.findUnique({
        where: { userId },
      });
      console.log('[Generate] Found subscription:', subscription);
      
      if (!subscription) {
        const limits = SUBSCRIPTION_LIMITS.FREE;
        const now = new Date();
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        subscription = await prisma.subscription.create({
          data: {
            userId,
            plan: 'FREE',
            credits: limits.weeklyCredits,
            monthlyCredits: limits.weeklyCredits,
            creditResetDate: nextWeek,
          },
        });
        console.log('[Generate] Created new subscription with weekly reset');
      }
      
      // Check if we need to reset credits (weekly for all plans)
      const limits = SUBSCRIPTION_LIMITS[subscription.plan] || SUBSCRIPTION_LIMITS.FREE;
      const resetDays = limits.creditResetDays || 7;
      const lastReset = subscription.creditResetDate || subscription.createdAt;
      const daysSinceReset = Math.floor((Date.now() - new Date(lastReset).getTime()) / (1000 * 60 * 60 * 24));
      
      let updateData = {
        usedCredits: {
          increment: creditCost,
        },
      };
      
      // Reset if past reset period
      if (daysSinceReset >= resetDays) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + resetDays);
        updateData.creditResetDate = nextWeek;
        updateData.usedCredits = creditCost; // Reset and start fresh
        console.log('[Generate] Credits reset for new period');
      }
      
      // Update usedCredits
      const updated = await prisma.subscription.update({
        where: { userId },
        data: updateData,
      });
      console.log('[Generate] Credit deducted. Used:', updated.usedCredits, 'Reset date:', updated.creditResetDate);
    }

    // Push ke Upstash Redis queue (dengan timeout 5s agar tidak hang)
    const jobData = {
      imageId: image.id, prompt: prompt.trim(), userId, model, generationMode,
      width, height, steps, guidanceScale, negativePrompt, visibility, referenceImage, strength,
    };
    try {
      await Promise.race([
        pushJob(jobData),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Queue push timeout')), 5000)),
      ]);
    } catch (queueErr) {
      console.warn('[Generate] Queue push failed:', queueErr.message);
      // Tetap lanjut — worker akan gagal tapi DB record sudah ada, client akan poll
    }

    // Trigger worker sebagai Vercel function terpisah (fire-and-forget)
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.seredityfy.art';
    triggerWorker(baseUrl);

    // Return PENDING langsung — client akan poll /api/generate/[id]
    return NextResponse.json({
      id: image.id,
      status: 'PENDING',
      prompt: prompt.trim(),
      model,
      visibility,
      width,
      height,
      createdAt: image.createdAt,
      creditsUsed: creditCost,
    }, { status: 202 });

  } catch (err) {
    console.error('Generate API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan');

    const models = [
      { id: 'seredityfy-v2', name: 'Seredityfy v2', description: 'Precision & Realism' },
      { id: 'cinematic-xl', name: 'Cinematic XL', description: 'High-Impact Drama' },
      { id: 'surrealist-flux', name: 'Surrealist Flux', description: 'Artistic Liberty' },
    ];

    const plans = {
      FREE: SUBSCRIPTION_LIMITS.FREE,
      STARTER: SUBSCRIPTION_LIMITS.STARTER,
      PRO: SUBSCRIPTION_LIMITS.PRO,
      ENTERPRISE: SUBSCRIPTION_LIMITS.ENTERPRISE,
    };

    return NextResponse.json({
      models: plan ? models : models.map(m => ({ id: m.id, name: m.name })),
      limits: plans,
      creditPlans: plans,
      generationModes: ['HYBRID', 'GEMINI_ONLY', 'CHATGPT_ONLY'],
    });

  } catch (err) {
    console.error('Generate GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
