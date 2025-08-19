import { env } from "@lunarweb/env";
import { logger } from "@lunarweb/logger";
import { DefaultLogger, type LogWriter } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

class WinstonLogger implements LogWriter {
	write(message: string) {
		logger.info(message);
	}
}

export const db = drizzle(env.DATABASE_URL || "", {
	logger: new DefaultLogger({ writer: new WinstonLogger() }),
	schema: schema,
});
