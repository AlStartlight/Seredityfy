function getRedisConfig() {
  const restUrl   = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (restUrl && restToken) {
    const host = restUrl.replace(/^https?:\/\//, '');
    return {
      host,
      port: 6379,
      password: restToken,
      tls: { rejectUnauthorized: false },
      connectTimeout: 5000,
      // Do NOT set enableOfflineQueue: false — Bull issues commands during
      // the connection handshake and needs the offline queue to buffer them.
    };
  }

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
    connectTimeout: 5000,
  };
}

export const redisConfig = getRedisConfig();
export default redisConfig;
