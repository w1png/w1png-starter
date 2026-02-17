import {
	isNull,
	type ColumnBaseConfig,
	type ColumnDataType,
} from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

export const commonFields = {
	id: pg
		.varchar("id", { length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => Bun.randomUUIDv7()),
	serial: pg.serial("serial").notNull(),
	createdAt: pg.timestamp("created_at").notNull().defaultNow(),
	updatedAt: pg
		.timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdateFn(() => new Date()),
	deletedAt: pg.timestamp("deleted_at"),
};

export function defaultIdx<
	T extends {
		id: pg.ExtraConfigColumn<ColumnBaseConfig<ColumnDataType, string>>;
		createdAt: pg.ExtraConfigColumn<ColumnBaseConfig<ColumnDataType, string>>;
		deletedAt: pg.ExtraConfigColumn<ColumnBaseConfig<ColumnDataType, string>>;
	},
>(t: T) {
	return {
		deleted_at_null_idx: pg.index().on(t.deletedAt).where(isNull(t.deletedAt)),
		id_idx: pg.index().on(t.id),
		created_at_idx: pg.index().on(t.createdAt),
	};
}
