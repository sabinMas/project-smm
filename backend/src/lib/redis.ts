import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis connected'));

let connected = false;

export async function connectRedis() {
  if (!connected) {
    await redis.connect();
    connected = true;
  }
}

export async function disconnectRedis() {
  if (connected) {
    await redis.disconnect();
    connected = false;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const val = await redis.get(key);
  return val ? JSON.parse(val) : null;
}

export async function cacheSet<T>(key: string, val: T, ttlSeconds = 3600): Promise<void> {
  await redis.setEx(key, ttlSeconds, JSON.stringify(val));
}

export async function cacheDelete(key: string): Promise<void> {
  await redis.del(key);
}

export { redis };
