import { createClient, type RedisClientType } from 'redis';

// Only create a client if REDIS_URL is explicitly set.
// Without this guard, the client tries localhost:6379 and floods logs with ECONNREFUSED.
const REDIS_URL = process.env.REDIS_URL;

let redis: RedisClientType | null = null;
let connected = false;

export async function connectRedis() {
  if (!REDIS_URL) {
    console.log('ℹ️  REDIS_URL not set — skipping Redis (cache disabled)');
    return;
  }

  redis = createClient({ url: REDIS_URL });
  redis.on('error', (err) => console.error('Redis Client Error', err));
  redis.on('connect', () => console.log('✅ Redis connected'));

  await redis.connect();
  connected = true;
}

export async function disconnectRedis() {
  if (connected && redis) {
    await redis.disconnect();
    connected = false;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis || !connected) return null;
  const val = await redis.get(key);
  return val ? JSON.parse(val) : null;
}

export async function cacheSet<T>(key: string, val: T, ttlSeconds = 3600): Promise<void> {
  if (!redis || !connected) return;
  await redis.setEx(key, ttlSeconds, JSON.stringify(val));
}

export async function cacheDelete(key: string): Promise<void> {
  if (!redis || !connected) return;
  await redis.del(key);
}

export { redis };
