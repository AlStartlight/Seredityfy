import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { popJob } from '@/src/lib/queue/upstashQueue';

export const maxDuration = 300;

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
          steps, guidanceScale, negativePrompt, visibility, referenceImage, strength } = job;

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
