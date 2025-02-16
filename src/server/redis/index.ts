import { createClient, type SetOptions } from "redis";
import { env } from "~/env";

const globalForRedis = globalThis as unknown as {
  redisClient: ReturnType<typeof createClient> | undefined;
};

const redis =
  globalForRedis.redisClient ?? createClient({ url: env.REDIS_URL });
if (env.NODE_ENV !== "production") globalForRedis.redisClient = redis;

redis.connect().catch((err) => console.error("Redis connection error:", err));
redis.on("error", (err) => console.error("Redis client error:", err));

async function cache<T>(
  fn: () => Promise<T>,
  key: string,
  options: SetOptions,
): Promise<T> {
  try {
    const cachedValue = await redis.get(key);

    if (cachedValue) {
      try {
        return JSON.parse(cachedValue) as T;
      } catch (parseError) {
        console.error("Cache parse error:", parseError);
      }
    }

    const result = await fn();
    try {
      const serializedResult = JSON.stringify(result);
      await redis.set(key, serializedResult, options);
    } catch (setError) {
      console.error("Cache set error:", setError);
    }
    return result;
  } catch (error) {
    console.error("Cache function error:", error);
    throw error;
  }
}

async function invalidate(key: string | RegExp): Promise<void> {
  try {
    if (typeof key === "string") {
      await redis.del(key);
    } else {
      let cursor = 0;
      const matchingKeys: string[] = [];

      do {
        const reply = await redis.scan(cursor, {
          MATCH: "*",
          COUNT: 50,
        });

        cursor = reply.cursor;
        const keys = reply.keys;

        keys.forEach((k) => {
          if (key.test(k)) {
            matchingKeys.push(k);
          }
        });
      } while (cursor !== 0);

      if (matchingKeys.length > 0) {
        while (matchingKeys.length) {
          const batch = matchingKeys.splice(0, 1000);
          await redis.del(batch);
        }
      }
    }
  } catch (error) {
    console.error("Invalidation error:", error);
    throw error;
  }
}

export { redis, cache, invalidate };
