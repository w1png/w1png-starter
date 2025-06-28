import { pgEnum, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const commonFields = {
	id: varchar("id", { length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => Bun.randomUUIDv7()),
	serial: serial("serial").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
};
