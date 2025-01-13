import { beforeEach, mock, spyOn } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "~/server/db/schema";
import { logger } from "~/server/logger";

const db = drizzle(new PGlite(), { schema });

mock.module("redis", () => {
  const store = new Map<string, string>();
  return {
    createClient: (_: { url: string }) => ({
      // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
      connect: () => {},
      get: async (key: string) => {
        const value = store.get(key);
        return new Promise((resolve) => resolve(value));
      },
      set: async (key: string, value: string, _: unknown) => {
        return new Promise((resolve) => {
          store.set(key, value);
          resolve(true);
        });
      },
      del: async (key: string) => {
        return new Promise((resolve) => {
          store.delete(key);
          resolve(true);
        });
      },
    }),
  };
});

mock.module("~/server/email", () => {
  return {
    email: {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
      send: async (_: { body: any; subject: string; to: string }) => {},
    },
  };
});

// @ts-ignore
// biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
spyOn(logger, "info").mockImplementation(() => {});

mock.module("../server/db", async () => {
  await migrate(db, {
    migrationsFolder: "./drizzle/",
  });

  return {
    db,
  };
});

mock.module("../env.js", () => {
  return {
    env: {
      DATABASE_URL: "asdfdasf",
      BETTER_AUTH_SECRET: "123123123123123",
      BETTER_AUTH_URL: "http://localhost:3000",
      NODE_ENV: "test",
      EMAIL_HOST: "test",
      EMAIL_PORT: 0,
      EMAIL_USER: "test",
      EMAIL_PASSWORD: "test",
      MAIN_ADMIN_EMAIL: "test@example.com",
      S3_REGION: process.env.S3_REGION,
      S3_ENDPOINT: process.env.S3_ENDPOINT,
      S3_BUCKET: process.env.S3_BUCKET,
      S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
      S3_SECRET_KEY: process.env.S3_SECRET_KEY,
      REDIS_URL: "",
    },
  };
});

beforeEach(async () => {
  try {
    const res = await db.execute(
      sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
    );
    for (const tableName of res.rows) {
      const tn = `"${tableName.tablename}"`;
      await db.execute(sql.raw(`TRUNCATE TABLE ${tn} CASCADE;`));
    }
  } catch (err) {
    console.error("Error truncating tables:", err);
    throw err;
  }
});
