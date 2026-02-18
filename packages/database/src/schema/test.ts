import * as pg from "drizzle-orm/pg-core";
import { commonFields, defaultIdx } from "./utils";
import { files } from "./file";

export const tests = pg.pgTable(
	"tests",
	{
		...commonFields,
		imageId: pg
			.varchar("image_id", { length: 255 })
			.notNull()
			.references(() => files.id),
		imageIds: pg.varchar("image_ids", { length: 255 }).notNull().array(),
		name: pg.varchar("name", { length: 255 }).notNull(),
		arr: pg.varchar("someval").notNull().array().notNull(),
		num: pg.integer().notNull(),
		bool: pg.boolean().notNull(),
		date: pg.timestamp(),
	},
	defaultIdx("tests"),
);
