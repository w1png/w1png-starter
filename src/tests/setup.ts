import { mock, afterAll, beforeEach } from "bun:test";
import { setupPostgresContainer } from "./containers/postgres";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { $ } from "bun";
import { redis } from "~/server/redis";
import { db } from "~/server/db";
import { sql } from "drizzle-orm";

let postgres: StartedPostgreSqlContainer;

async function migrate() {
  const res =
    await $`env DATABASE_URL=${postgres.getConnectionUri()} bunx drizzle-kit push`;
  console.log(res.text());
}

mock.module("redis", () => {
  let store = new Map();
  return {
    createClient: (_: { url: string }) => ({
      connect: () => {},
      get: async (key) => {
        const value = store.get(key);
        return new Promise((resolve) => resolve(value));
      },
      set: async (key, value, ttl) => {
        store.set(key, value);
      },
      del: async (key) => {
        store.delete(key);
      },
    }),
  };
});

mock.module("../server/email/index.ts", () => {
  return {
    email: {
      send: async (_: { body: any; subject: string; to: string }) => {},
    },
  };
});

mock.module("../env.js", async () => {
  postgres = await setupPostgresContainer();
  await migrate();

  return {
    env: {
      DATABASE_URL: postgres.getConnectionUri(),
      BETTER_AUTH_SECRET: "123123123123123",
      BETTER_AUTH_URL: "http://localhost:3000",
      NODE_ENV: "test",
      EMAIL_HOST: "test",
      EMAIL_PORT: 0,
      EMAIL_USER: "test",
      EMAIL_PASSWORD: "test",
      MAIN_ADMIN_EMAIL: "test@example.com",
      S3_REGION: "test",
      S3_ENDPOINT: "test",
      S3_BUCKET: "test",
      S3_ACCESS_KEY: "test",
      S3_SECRET_KEY: "test",
      REDIS_URL: "",
    },
  };
});

beforeEach(async () => {
  await redis.flushAll();
  try {
    const res = await db.execute(
      sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
    );
    for (const tableName of res) {
      const tn = `"${tableName.tablename}"`;
      await db.execute(sql.raw(`TRUNCATE TABLE ${tn} CASCADE;`));
    }
  } catch (err) {
    console.error("Error truncating tables:", err);
    throw err;
  }
});

afterAll(async () => {
  console.log("TEARDOWN");
  await postgres.stop();
});
