import { beforeEach } from "bun:test";
import { sql } from "drizzle-orm";
import { db } from "~/server/db";
import { redis } from "~/server/redis";

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
