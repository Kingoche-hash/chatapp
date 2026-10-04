import Redis from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.redisUrl, { lazyConnect: true });

redis.on('error', (error) => {
  console.error('Redis error:', error.message);
});

// Connects, but gives up after 5 seconds so a missing Redis does not hang the server.
export const connectRedis = async () => {
  await Promise.race([
    redis.connect(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis connection timed out')), 5000)
    ),
  ]);

  console.log('Redis connected');
};