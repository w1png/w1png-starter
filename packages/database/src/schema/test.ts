import * as pg from "drizzle-orm/pg-core";
import { commonFields } from "./utils";

export function createTestsTable(name = "tests") {
	return pg.pgTable(name, {
		...commonFields,
		name: pg.text("name").notNull(),
		bool: pg.boolean("bool").notNull(),
		arr: pg.jsonb("arr").$type<string[]>().notNull(),
		imageId: pg.text("image_id").notNull(),
		imageIds: pg.jsonb("image_ids").$type<string[]>().notNull(),
	});
}
export const tests = createTestsTable();
