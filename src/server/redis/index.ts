import { createClient } from "redis";
import { env } from "~/env";

const globalForRedis = globalThis as unknown as {
  url: string | undefined;
};

const conn = globalForRedis.url ?? env.REDIS_URL;
if (env.NODE_ENV !== "production") globalForRedis.url = conn;

const redis = createClient({ url: conn });
redis.connect();

export { redis };
