import "dotenv/config";
import { Database } from "@lunarweb/database";
import { FileRouter, FileService } from "@lunarweb/files";
import { Logger } from "@lunarweb/logger";
import { Redis } from "@lunarweb/redis";
import { hashPassword } from "better-auth/crypto";
import { Auth } from "./auth";
import { Context } from "./context";
import { Env } from "./env";
import { Server } from "./http/server";
import { ORPC } from "./orpc/orpc";
import { TestRouter } from "./orpc/routers/test";
import { UserRouter } from "./orpc/routers/user";
import { UserService } from "./services/user";

export async function main() {
	const env = new Env();
	const logger = new Logger({
		prettyLog: env.values.NODE_ENV !== "production",
	});
	const db = new Database({
		databaseUrl: env.values.DATABASE_URL,
		maxConnections: env.values.DATABASE_POOL_SIZE,
	});
	const redis = new Redis({
		redisUrl: env.values.REDIS_URL,
		onError: (error) => logger.error(error),
	});
	const context = new Context({ db, redis, env, logger });
	let http: Server | undefined;
	const close = async () => {
		try {
			await http?.close();
		} finally {
			await Promise.all([redis.close(), db.close()]);
		}
	};
	try {
		await redis.connect();
		const auth = new Auth({ context });
		const userService = new UserService({
			context,
			hashPassword,
		});
		const fileService = new FileService({
			context,
			storage: new Bun.S3Client({
				region: env.values.S3_REGION,
				endpoint: env.values.S3_ENDPOINT,
				accessKeyId: env.values.S3_ACCESS_KEY,
				secretAccessKey: env.values.S3_SECRET_KEY,
			}),
		});
		const userRouter = new UserRouter();
		const testRouter = new TestRouter({ context });
		const fileRouter = new FileRouter({ fileService });
		const orpc = new ORPC({ context, auth, userRouter, testRouter });
		http = new Server({ context, auth, orpc, fileRouter });
		await userService.ensureMainAdmin({
			email: env.values.MAIN_ADMIN_EMAIL,
			password: env.values.MAIN_ADMIN_PASSWORD,
		});
		http.run();
		let closing = false;
		const shutdown = () => {
			if (closing) return;
			closing = true;
			void close().catch((error) => {
				logger.error(error);
				process.exitCode = 1;
			});
		};
		process.once("SIGTERM", shutdown);
		process.once("SIGINT", shutdown);
		return { context, http, orpc, close };
	} catch (error) {
		await close();
		throw error;
	}
}

if (import.meta.main) {
	main().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}
