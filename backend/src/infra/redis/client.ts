import { createClient } from 'redis';
import { env } from '../../config/env';

// Support both connection string (Render/Heroku) and individual params (local dev)
export const redisClient = createClient(
  env.REDIS_URL
    ? {
        url: env.REDIS_URL,
      }
    : {
        socket: {
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
        },
      }
);

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

// Token revocation: record a timestamp per user; any JWT issued before that time is rejected.
// TTL is set to the maximum JWT lifetime (8h) so the key auto-expires.
const JWT_MAX_LIFETIME_SECONDS = 8 * 60 * 60;

export async function revokeUserTokens(userId: number): Promise<void> {
  await redisClient.setEx(
    `revoked:user:${userId}`,
    JWT_MAX_LIFETIME_SECONDS,
    Date.now().toString()
  );
}

export async function getUserTokenRevokedAt(userId: number): Promise<number | null> {
  const value = await redisClient.get(`revoked:user:${userId}`);
  return value ? parseInt(value, 10) : null;
}
