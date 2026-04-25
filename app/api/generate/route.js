import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { checkUserPermissions, getVisibilityForUser, calculateCreditCost } from '@/src/lib/services/visibility';
import { auth } from '../../../auth';
import { pushJob } from '@/src/lib/queue/upstashQueue';

function triggerWorker(baseUrl) {
  fetch(`${baseUrl}/api/queue/worker`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.WORKER_SECRET}` },
  }).catch(err => console.warn('[Generate] Worker trigger failed:', err.message));
}

export async function POST(request) {
  try {
    // 1. Auth — satu await, cepat
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const isAuthenticated = !!userId;

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

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    if (prompt.length > 1000) {
      return NextResponse.json({ error: 'Prompt too long (max 1000 characters)' }, { status: 400 });
    }

    // 2. Permission check (1 DB query) — tolak jika tidak ada kredit
    if (isAuthenticated) {
      const permissions = await checkUserPermissions(userId, width, height, model);

      if (!permissions.canGenerate) {
        const daysUntilReset = permissions.nextResetDate
          ? Math.max(0, Math.ceil((new Date(permissions.nextResetDate) - Date.now()) / 86_400_000))
          : 7;
        return NextResponse.json({
          error: `Weekly credit limit reached. Next reset in ${daysUntilReset} days.`,
          plan: permissions.plan,
          availableCredits: permissions.availableCredits,
          nextResetDate: permissions.nextResetDate,
          upgradeUrl: '/admin/billing',
        }, { status: 429 });
      }

      if (width > permissions.limits.maxWidth || height > permissions.limits.maxHeight) {
        return NextResponse.json({
          error: `Max resolution for your plan: ${permissions.limits.maxWidth}x${permissions.limits.maxHeight}.`,
          upgradeUrl: '/admin/billing',
        }, { status: 403 });
      }
    }

    // 3. Visibility (1 DB query) + create image record (1 DB write)
    const [visibility, image] = await Promise.all([
      getVisibilityForUser(userId, requestedVisibility),
      prisma.generatedImage.create({
        data: {
          prompt: prompt.trim(),
          model,
          generationMode,
          status: 'PENDING',
          visibility: requestedVisibility,
          width,
          height,
          steps,
          guidanceScale,
          negativePrompt,
          ...(userId ? { userId } : {}),
          metadata: {
            requestedAt: new Date().toISOString(),
            isAuthenticated,
            hasReferenceImage: !!referenceImage,
          },
        },
      }),
    ]);

    const creditCost = calculateCreditCost(width, height, model);

    // 4. Push job ke Upstash (3s timeout) — credit deduction dilakukan di worker
    try {
      await Promise.race([
        pushJob({
          imageId: image.id, prompt: prompt.trim(), userId, model, generationMode,
          width, height, steps, guidanceScale, negativePrompt, visibility,
          referenceImage, strength, creditCost,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Queue timeout')), 3000)),
      ]);
    } catch (qErr) {
      console.warn('[Generate] Queue push failed (proceeding):', qErr.message);
    }

    // 5. Trigger worker (fire-and-forget) — tidak di-await
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.seredityfy.art';
    triggerWorker(baseUrl);

    // 6. Return PENDING segera
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
    console.error('[Generate] API error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get('plan');

  const models = [
    { id: 'seredityfy-v2', name: 'Seredityfy v2', description: 'Precision & Realism' },
    { id: 'cinematic-xl', name: 'Cinematic XL', description: 'High-Impact Drama' },
    { id: 'surrealist-flux', name: 'Surrealist Flux', description: 'Artistic Liberty' },
  ];

  return NextResponse.json({
    models: plan ? models : models.map(m => ({ id: m.id, name: m.name })),
    generationModes: ['HYBRID', 'GEMINI_ONLY', 'CHATGPT_ONLY'],
  });
}
