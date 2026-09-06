import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { RedisContainer } from "@testcontainers/redis";
import type { TestProject } from "vitest/node";

export default async function setup(project: TestProject) {
	const postgres = await new PostgreSqlContainer("postgres:17-alpine").start();
	try {
		const redis = await new RedisContainer("redis:8-alpine").start();
		project.provide("databaseUrl", postgres.getConnectionUri());
		project.provide("redisUrl", redis.getConnectionUrl());
		return async () => {
			await Promise.allSettled([redis.stop(), postgres.stop()]);
		};
	} catch (error) {
		await postgres.stop();
		throw error;
	}
}

declare module "vitest" {
	export interface ProvidedContext {
		databaseUrl: string;
		redisUrl: string;
	}
}
