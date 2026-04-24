/**
 * Redis connection config factory.
 *
 * Priority:
 *  1. Upstash  — UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  (production / Vercel)
 *  2. Local    — REDIS_HOST / REDIS_PORT / REDIS_PASSWORD            (development)
 *
 * Upstash exposes two protocols:
 *  - REST  (UPSTASH_REDIS_REST_URL)   → used by @upstash/redis HTTP client
 *  - Redis (ioredis / bull)           → same host, port 6380, password = REST token, TLS on
 *
 * This file converts the REST credentials into an ioredis-compatible config so that
 * Bull queues work without a separate UPSTASH_REDIS_URL env var.
 */

function getRedisConfig() {
  const restUrl   = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (restUrl && restToken) {
    // Strip protocol prefix — ioredis needs just the hostname
    const host = restUrl.replace(/^https?:\/\//, '');

    return {
      host,
      port: 6380,          // Upstash Redis-protocol port (always 6380)
      password: restToken,
      tls: {},             // Upstash requires TLS on the Redis protocol port
    };
  }

  // Local / self-hosted Redis
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
  };
}

export const redisConfig = getRedisConfig();

export default redisConfig;
