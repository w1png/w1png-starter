import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
export { user, session, account, verification } from "./auth-schema";

export const files = pgTable("files", {
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
