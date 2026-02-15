import { createClient } from 'redis';
import { env } from '../../config/env';

export const redisClient = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

export async function connectRedis() {
  await redisClient.connect();
}

// OTP helpers
export async function setOTP(key: string, hash: string, ttlSeconds: number): Promise<void> {
  await redisClient.setEx(key, ttlSeconds, hash);
}

export async function getOTP(key: string): Promise<string | null> {
  return await redisClient.get(key);
}

export async function deleteOTP(key: string): Promise<void> {
  await redisClient.del(key);
}

// Attempt tracking
export async function incrementAttempts(key: string, ttlSeconds: number): Promise<number> {
  const attempts = await redisClient.incr(key);
  if (attempts === 1) {
    await redisClient.expire(key, ttlSeconds);
  }
  return attempts;
}

export async function getAttempts(key: string): Promise<number> {
  const value = await redisClient.get(key);
  return value ? parseInt(value, 10) : 0;
}
