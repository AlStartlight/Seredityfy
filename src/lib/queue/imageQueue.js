import Queue from 'bull';

const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
};

export const imageGenerationQueue = new Queue('image-generation', redisConfig);

export const imageProcessingQueue = new Queue('image-processing', redisConfig);

export async function addImageGenerationJob(data) {
  const job = await imageGenerationQueue.add(
    'generate',
    {
      imageId: data.imageId,
      prompt: data.prompt,
      userId: data.userId,
      model: data.model,
      generationMode: data.generationMode,
      width: data.width,
      height: data.height,
      steps: data.steps,
      guidanceScale: data.guidanceScale,
      negativePrompt: data.negativePrompt,
      visibility: data.visibility,
      createdAt: new Date().toISOString(),
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    }
  );

  return job;
}

export async function addImageProcessingJob(data) {
  const job = await imageProcessingQueue.add(
    'process',
    {
      imageId: data.imageId,
      imageData: data.imageData,
      mimeType: data.mimeType,
      userId: data.userId,
      prompt: data.prompt,
      metadata: data.metadata,
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    }
  );

  return job;
}

export async function getJobStatus(jobId) {
  const job = await imageGenerationQueue.getJob(jobId);
  
  if (!job) {
    return { status: 'not_found' };
  }

  const state = await job.getState();
  const progress = job.progress();
  const data = job.data;
  const result = job.returnvalue;

  return {
    status: state,
    progress,
    data,
    result,
    failedReason: job.failedReason,
  };
}

export async function getQueueStats() {
  const [generating, completed, failed, delayed] = await Promise.all([
    imageGenerationQueue.getActiveCount(),
    imageGenerationQueue.getCompletedCount(),
    imageGenerationQueue.getFailedCount(),
    imageGenerationQueue.getDelayedCount(),
  ]);

  return {
    generating,
    completed,
    failed,
    delayed,
    waiting: await imageGenerationQueue.getWaitingCount(),
  };
}

export default {
  imageGenerationQueue,
  imageProcessingQueue,
  addImageGenerationJob,
  addImageProcessingJob,
  getJobStatus,
  getQueueStats,
};
