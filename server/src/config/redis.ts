import Redis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

export const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 3) return null; // fallback gracefully if Redis is not running locally
    return Math.min(times * 100, 2000);
  },
});

redis.on("connect", () => {
  console.log("Redis client connected");
});

redis.on("error", (err) => {
  console.warn("Redis connection error (fallback mode active):", err.message);
});

// Helper utilities
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

export const setCachedData = async (key: string, value: any, ttlSeconds = 3600): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    // Ignore cache write errors if Redis unavailable
  }
};

export const invalidateCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    // Ignore cache invalidate errors if Redis unavailable
  }
};
