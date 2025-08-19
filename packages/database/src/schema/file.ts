import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { commonFields } from "./utils";

export const files = pgTable("files", {
	...commonFields,

	fileName: varchar("file_name", { length: 255 }).notNull(),
	fileSize: integer("file_size").notNull(),
	contentType: varchar("content_type", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
