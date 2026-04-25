import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { popJob } from '@/src/lib/queue/upstashQueue';
import { SUBSCRIPTION_LIMITS } from '@/src/lib/services/visibility';

export const maxDuration = 300;

async function deductCredit(userId, creditCost) {
  if (!userId || !creditCost) return;
  try {
    let sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) {
      const limits = SUBSCRIPTION_LIMITS.FREE;
      const nextWeek = new Date(Date.now() + 7 * 86_400_000);
      sub = await prisma.subscription.create({
        data: { userId, plan: 'FREE', credits: limits.weeklyCredits,
          monthlyCredits: limits.weeklyCredits, creditResetDate: nextWeek },
      });
    }
    const limits = SUBSCRIPTION_LIMITS[sub.plan] || SUBSCRIPTION_LIMITS.FREE;
    const daysSince = Math.floor((Date.now() - new Date(sub.creditResetDate || sub.createdAt)) / 86_400_000);
    const resetDays = limits.creditResetDays || 7;
    if (daysSince >= resetDays) {
      await prisma.subscription.update({
        where: { userId },
        data: { usedCredits: creditCost, creditResetDate: new Date(Date.now() + resetDays * 86_400_000) },
      });
    } else {
      await prisma.subscription.update({
        where: { userId },
        data: { usedCredits: { increment: creditCost } },
      });
    }
  } catch (err) {
    console.warn('[Worker] Credit deduction failed:', err.message);
  }
}

export async function POST(request) {
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.WORKER_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const job = await popJob();
  if (!job) {
    return NextResponse.json({ message: 'No jobs in queue' });
  }

  const { imageId, prompt, userId, model, generationMode, width, height,
          steps, guidanceScale, negativePrompt, visibility, referenceImage, strength,
          creditCost } = job;

  console.log(`[Worker] Processing image ${imageId}`);

  try {
    const [{ generateHybridImage }, { uploadBase64Image }] = await Promise.all([
      import('@/src/lib/ai/hybrid'),
      import('@/src/lib/storage/cloudinary'),
    ]);

    const result = await generateHybridImage({
      prompt, userId, model, generationMode,
      width, height, steps, guidanceScale,
      negativePrompt, referenceImage, strength,
    });

    if (!result.success) {
      await prisma.generatedImage.update({
        where: { id: imageId },
        data: { status: 'FAILED', metadata: { error: result.error } },
      });
      return NextResponse.json({ success: false, error: result.error });
    }

    const uploadResult = await uploadBase64Image(
      result.imageData,
      result.mimeType || 'image/png',
      `seredityfy/users/${userId || 'anonymous'}`
    );

    if (!uploadResult.success) {
      await prisma.generatedImage.update({
        where: { id: imageId },
        data: { status: 'FAILED', metadata: { error: 'Upload failed' } },
      });
      return NextResponse.json({ success: false, error: 'Upload failed' });
    }

    await prisma.generatedImage.update({
      where: { id: imageId },
      data: {
        status: 'COMPLETED',
        imageUrl: uploadResult.url,
        thumbnailUrl: uploadResult.url,
        enhancedPrompt: result.enhancedPrompt,
        metadata: result.metadata,
        width: uploadResult.width || width,
        height: uploadResult.height || height,
      },
    });

    // Deduct credit setelah berhasil generate
    await deductCredit(userId, creditCost);

    console.log(`[Worker] Image ${imageId} completed`);
    return NextResponse.json({ success: true, imageId, imageUrl: uploadResult.url });

  } catch (err) {
    console.error(`[Worker] Image ${imageId} failed:`, err.message);
    await prisma.generatedImage.update({
      where: { id: imageId },
      data: { status: 'FAILED', metadata: { error: err.message } },
    }).catch(() => {});
    return NextResponse.json({ success: false, error: err.message });
  }
}
