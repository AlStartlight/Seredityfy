import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { checkUserPermissions, getVisibilityForUser, SUBSCRIPTION_LIMITS, calculateCreditCost } from '@/src/lib/services/visibility';
import { auth } from '../../../auth';

export const maxDuration = 60;

export async function POST(request) {
  try {
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
      referenceMode = 'face',
      strength = 0.7,
    } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (prompt.trim().length > 400) {
      return NextResponse.json({
        error: 'Prompt melebihi batas 400 karakter. Silakan persingkat prompt Anda.',
        characterCount: prompt.trim().length,
        maxAllowed: 400,
      }, { status: 400 });
    }

    // Permission check
    if (isAuthenticated) {
      const permissions = await checkUserPermissions(userId, width, height, model);
      if (!permissions.canGenerate) {
        const days = permissions.nextResetDate
          ? Math.max(0, Math.ceil((new Date(permissions.nextResetDate) - Date.now()) / 86_400_000))
          : 7;
        return NextResponse.json({
          error: `Credit limit reached. Next reset in ${days} days.`,
          plan: permissions.plan,
          availableCredits: permissions.availableCredits,
          upgradeUrl: '/admin/billing',
        }, { status: 429 });
      }
    }

    const [visibility, image] = await Promise.all([
      getVisibilityForUser(userId, requestedVisibility),
      prisma.generatedImage.create({
        data: {
          prompt: prompt.trim(), model, generationMode,
          status: 'PENDING', visibility: requestedVisibility,
          width, height, steps, guidanceScale, negativePrompt,
          ...(userId ? { userId } : {}),
          metadata: { requestedAt: new Date().toISOString(), isAuthenticated },
        },
      }),
    ]);

    const creditCost = calculateCreditCost(width, height, model);

    // Generate langsung dalam request ini
    try {
      const [{ generateHybridImage }, { uploadBase64Image }] = await Promise.all([
        import('@/src/lib/ai/hybrid'),
        import('@/src/lib/storage/cloudinary'),
      ]);

      const result = await generateHybridImage({
        prompt: prompt.trim(), userId, model, generationMode,
        width, height, steps, guidanceScale, negativePrompt, referenceImage, referenceMode, strength,
      });

      if (!result.success) {
        await prisma.generatedImage.update({ where: { id: image.id }, data: { status: 'FAILED' } });
        return NextResponse.json(
          { error: result.error || 'Generation failed', status: 'FAILED', id: image.id },
          { status: 500 }
        );
      }

      const upload = await uploadBase64Image(
        result.imageData, result.mimeType || 'image/png',
        `seredityfy/users/${userId || 'anonymous'}`
      );

      if (!upload.success) {
        await prisma.generatedImage.update({ where: { id: image.id }, data: { status: 'FAILED' } });
        return NextResponse.json(
          { error: 'Upload failed', status: 'FAILED', id: image.id },
          { status: 500 }
        );
      }

      // Update image + deduct credit secara parallel
      const [completed] = await Promise.all([
        prisma.generatedImage.update({
          where: { id: image.id },
          data: {
            status: 'COMPLETED', imageUrl: upload.url, thumbnailUrl: upload.url,
            enhancedPrompt: result.enhancedPrompt, metadata: result.metadata,
            width: upload.width || width, height: upload.height || height,
          },
        }),
        userId ? deductCredit(userId, creditCost) : Promise.resolve(),
      ]);

      return NextResponse.json({
        id: completed.id, status: 'COMPLETED',
        imageUrl: completed.imageUrl, thumbnailUrl: completed.thumbnailUrl,
        enhancedPrompt: completed.enhancedPrompt, prompt: completed.prompt,
        model: completed.model, visibility: completed.visibility,
        width: completed.width, height: completed.height,
        createdAt: completed.createdAt, creditsUsed: creditCost,
      }, { status: 201 });

    } catch (genErr) {
      console.error('[Generate] Error:', genErr.message);
      await prisma.generatedImage.update({ where: { id: image.id }, data: { status: 'FAILED' } }).catch(() => {});
      return NextResponse.json(
        { error: genErr.message || 'Generation failed', status: 'FAILED', id: image.id },
        { status: 500 }
      );
    }

  } catch (err) {
    console.error('[Generate] API error:', err.message);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}

async function deductCredit(userId, creditCost) {
  try {
    let sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) {
      const nextWeek = new Date(Date.now() + 7 * 86_400_000);
      sub = await prisma.subscription.create({
        data: { userId, plan: 'FREE', credits: 40, monthlyCredits: 40, creditResetDate: nextWeek },
      });
    }
    const limits = SUBSCRIPTION_LIMITS[sub.plan] || SUBSCRIPTION_LIMITS.FREE;
    const daysSince = Math.floor((Date.now() - new Date(sub.creditResetDate || sub.createdAt)) / 86_400_000);
    await prisma.subscription.update({
      where: { userId },
      data: daysSince >= (limits.creditResetDays || 7)
        ? { usedCredits: creditCost, creditResetDate: new Date(Date.now() + 7 * 86_400_000) }
        : { usedCredits: { increment: creditCost } },
    });
  } catch (e) {
    console.warn('[Generate] Credit deduction failed:', e.message);
  }
}

export async function GET() {
  return NextResponse.json({
    models: [
      { id: 'seredityfy-v2', name: 'Seredityfy v2' },
      { id: 'cinematic-xl', name: 'Cinematic XL' },
      { id: 'surrealist-flux', name: 'Surrealist Flux' },
    ],
    generationModes: ['HYBRID', 'GEMINI_ONLY', 'CHATGPT_ONLY'],
  });
}
