import { drizzle } from "drizzle-orm/bun-sql";

import { DefaultLogger, type LogWriter } from "drizzle-orm";
import { env } from "~/env";
import { logger } from "~/server/logger";
import * as schema from "./schema";

class WinstonLogger implements LogWriter {
  write(message: string) {
    logger.info(message);
  }
}

export const db = drizzle(env.DATABASE_URL, {
  schema,
  logger: new DefaultLogger({ writer: new WinstonLogger() }),
});
