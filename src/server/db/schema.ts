import {
  integer,
  pgTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
export {user, session, account, verification} from "./auth-schema"

export const createTable = pgTableCreator((name) => `project_${name}`);

export const files = createTable("files", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(),
  placeholder: text("placeholder"),
  contentType: varchar("content_type", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
