import { test as base, inject } from "vitest";
import { Database } from "@lunarweb/database";
import {
	createAuthTables,
	createTestsTable,
	createFilesTable,
} from "@lunarweb/database/schema";
import { Context } from "../src/context";
import { Env } from "../src/env";
import { Logger } from "@lunarweb/logger";
import { Redis } from "@lunarweb/redis";

export const test = base.extend<{
	resources: {
		database: Database;
		redis: Redis;
		prefix: string;
		context: Context;
	};
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitest requires destructuring for fixture dependency discovery.
	resources: async ({}, use) => {
		const prefix = `${crypto.randomUUID()}_`;
		const authTables = createAuthTables(prefix);
		const table = createTestsTable(`${prefix}tests`);
		const fileTable = createFilesTable(`${prefix}files`);
		const database = new Database({
			tables: { ...authTables, tests: table, files: fileTable },
			databaseUrl: inject("databaseUrl"),
			maxConnections: 2,
		});
		const redis = new Redis({
			redisUrl: inject("redisUrl"),
			onError: () => {},
		});
		const context = new Context({
			db: database,
			redis,
			logger: new Logger({ prettyLog: false }),
			env: new Env({
				NODE_ENV: "test",
				DATABASE_URL: inject("databaseUrl"),
				REDIS_URL: inject("redisUrl"),
				FRONTEND_URL: "http://localhost:3001",
				BACKEND_URL: "http://localhost:3000",
				CORS_COOKIE_DOMAIN: "localhost",
				BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters",
				MAIN_ADMIN_EMAIL: "admin@example.com",
				MAIN_ADMIN_PASSWORD: "test-password",
				S3_REGION: "us-east-1",
				S3_ENDPOINT: "http://localhost:9000",
				S3_ACCESS_KEY: "test",
				S3_SECRET_KEY: "test",
			}),
		});
		try {
			await redis.connect();
			await database.client.unsafe(`CREATE TABLE "${prefix}tests" (
    id text PRIMARY KEY, serial serial NOT NULL, created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(), deleted_at timestamp,
    name text NOT NULL, bool boolean NOT NULL, arr jsonb NOT NULL, image_id text NOT NULL, image_ids jsonb NOT NULL
   )`);
			await database.client.unsafe(`CREATE TABLE "${prefix}user" (
    id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
    email_verified boolean NOT NULL, image text, created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL, role text NOT NULL DEFAULT 'USER'
   )`);
			await database.client.unsafe(`CREATE TABLE "${prefix}account" (
    id text PRIMARY KEY, account_id text NOT NULL, provider_id text NOT NULL,
    user_id text NOT NULL REFERENCES "${prefix}user"(id) ON DELETE CASCADE,
    access_token text, refresh_token text, id_token text, access_token_expires_at timestamp,
    refresh_token_expires_at timestamp, scope text, password text,
    created_at timestamp NOT NULL, updated_at timestamp NOT NULL
   )`);
			await database.client.unsafe(`CREATE TABLE "${prefix}files" (
 id text PRIMARY KEY, serial serial NOT NULL, created_at timestamp NOT NULL DEFAULT now(),
 updated_at timestamp NOT NULL DEFAULT now(), deleted_at timestamp,
 name varchar(255) NOT NULL, size integer NOT NULL, content_type varchar(255) NOT NULL
 )`);
			await use({ database, redis, prefix, context });
		} finally {
			try {
				await database.client.unsafe(
					`DROP TABLE IF EXISTS "${prefix}account", "${prefix}user", "${prefix}tests", "${prefix}files" CASCADE`,
				);
				if (redis.client.isReady) {
					for await (const keys of redis.client.scanIterator({
						MATCH: `${prefix}*`,
						COUNT: 100,
					})) {
						if (keys.length) await redis.client.del(keys);
					}
				}
			} finally {
				await Promise.allSettled([database.close(), redis.close()]);
			}
		}
	},
});
