import { createClient } from "redis";
import { env } from "~/env";

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

if (!globalForRedis.redis) {
  const redis = createClient({ url: env.REDIS_URL });
  globalForRedis.redis = redis;
  redis.on("error", (err) => {
    console.error("Redis Client Error", err);
  });
  await redis.connect();
}

export const redis = globalForRedis.redis;
