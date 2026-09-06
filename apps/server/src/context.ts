import type { Database } from "@lunarweb/database";
import type { Logger } from "@lunarweb/logger";
import type { Redis } from "@lunarweb/redis";
import type { Env } from "./env";

export class Context {
	readonly db;
	readonly redis;
	readonly env;
	readonly logger;
	constructor({
		db,
		redis,
		env,
		logger,
	}: { db: Database; redis: Redis; env: Env; logger: Logger }) {
		this.db = db;
		this.redis = redis;
		this.env = env;
		this.logger = logger;
	}
}
