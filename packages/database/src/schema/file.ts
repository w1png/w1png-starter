import * as pg from "drizzle-orm/pg-core";
import { commonFields, defaultIdx } from "./utils";

export function createFilesTable(name = "files") {
	return pg.pgTable(
		name,
		{
			...commonFields,

			name: pg.varchar("name", { length: 255 }).notNull(),
			size: pg.integer("size").notNull(),
			contentType: pg.varchar("content_type", { length: 255 }).notNull(),
		},
		defaultIdx(name),
	);
}
export const files = createFilesTable();
