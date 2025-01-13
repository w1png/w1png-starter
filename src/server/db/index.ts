import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import * as schema from "./schema";
import { logger } from "~/server/logger";
import { DefaultLogger, type LogWriter } from "drizzle-orm";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn =
  globalForDb.conn ??
  postgres(env.DATABASE_URL, {
    onnotice: (n) => {
      logger.warn(n);
    },
  });
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

class WinstonLogger implements LogWriter {
  write(message: string) {
    logger.info(message);
  }
}

export const db = drizzle(conn, {
  schema,
  logger: new DefaultLogger({ writer: new WinstonLogger() }),
});
