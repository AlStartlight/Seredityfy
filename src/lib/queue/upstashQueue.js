import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const QUEUE_KEY = 'seredityfy:image:jobs';

export async function pushJob(jobData) {
  await redis.lpush(QUEUE_KEY, JSON.stringify(jobData));
}

export async function popJob() {
  const data = await redis.rpop(QUEUE_KEY);
  return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
}

export async function queueLength() {
  return redis.llen(QUEUE_KEY);
}
