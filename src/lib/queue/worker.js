import prisma from '@/src/lib/prisma';
import { generateHybridImage } from '@/src/lib/ai/hybrid';
import { uploadBase64Image } from '@/src/lib/storage/cloudinary';
import { generatePromptEmbedding } from '@/src/lib/ai/chatgpt';
import { imageGenerationQueue, imageProcessingQueue } from './imageQueue';

async function processImageGeneration(job) {
  const { 
    imageId, 
    prompt, 
    userId, 
    model, 
    generationMode,
    width, 
    height, 
    steps, 
    guidanceScale, 
    negativePrompt,
    visibility,
    referenceImage,
    strength,
  } = job.data;

  console.log(`[Worker] Processing image ${imageId}${referenceImage ? ' (with reference image)' : ''}`);

  try {
    await job.progress(10);

    await prisma.generatedImage.update({
      where: { id: imageId },
      data: { status: 'PENDING' },
    });

    await job.progress(30);

    const result = await generateHybridImage({
      prompt,
      userId,
      model,
      generationMode,
      width,
      height,
      steps,
      guidanceScale,
      negativePrompt,
      referenceImage,
      strength,
    });

    if (!result.success) {
      await prisma.generatedImage.update({
        where: { id: imageId },
        data: { status: 'FAILED' },
      });
      throw new Error(result.error || 'Generation failed');
    }

    await job.progress(60);

    const uploadResult = await uploadBase64Image(
      result.imageData,
      result.mimeType || 'image/png',
      `seredityfy/users/${userId}`
    );

    if (!uploadResult.success) {
      await prisma.generatedImage.update({
        where: { id: imageId },
        data: { status: 'FAILED' },
      });
      throw new Error('Failed to upload image');
    }

    await job.progress(80);

    let promptEmbedding = null;
    if (result.promptEmbedding) {
      promptEmbedding = result.promptEmbedding;
    } else {
      const embeddingResult = await generatePromptEmbedding(result.prompt);
      if (embeddingResult.success) {
        promptEmbedding = embeddingResult.embedding;
      }
    }

    await prisma.generatedImage.update({
      where: { id: imageId },
      data: {
        status: 'COMPLETED',
        imageUrl: uploadResult.url,
        thumbnailUrl: uploadResult.url,
        enhancedPrompt: result.enhancedPrompt,
        metadata: result.metadata,
        width: uploadResult.width,
        height: uploadResult.height,
        visibility: visibility || 'PUBLIC',
      },
    });

    if (promptEmbedding) {
      await prisma.promptEmbedding.upsert({
        where: { imageId },
        create: {
          imageId,
          embedding: promptEmbedding,
          model: 'text-embedding-3-small',
        },
        update: {
          embedding: promptEmbedding,
        },
      });
    }

    await prisma.promptHistory.create({
      data: {
        userId,
        prompt,
        enhancedPrompt: result.enhancedPrompt,
        model,
      },
    });

    await job.progress(100);

    console.log(`[Worker] Image ${imageId} generated successfully`);

    return {
      success: true,
      imageId,
      imageUrl: uploadResult.url,
      thumbnailUrl: uploadResult.url,
      enhancedPrompt: result.enhancedPrompt,
      metadata: result.metadata,
    };
  } catch (error) {
    console.error(`[Worker] Error processing image ${imageId}:`, error);
    
    await prisma.generatedImage.update({
      where: { id: imageId },
      data: { status: 'FAILED' },
    });

    throw error;
  }
}

export function startWorker() {
  console.log('[Worker] Starting image generation worker...');

  imageGenerationQueue.process('generate', 2, processImageGeneration);

  imageGenerationQueue.on('completed', (job, result) => {
    console.log(`[Worker] Job ${job.id} completed:`, result);
  });

  imageGenerationQueue.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  imageGenerationQueue.on('progress', (job, progress) => {
    console.log(`[Worker] Job ${job.id} progress: ${progress}%`);
  });

  console.log('[Worker] Worker is ready and listening for jobs');
}

export default {
  startWorker,
  processImageGeneration,
};
