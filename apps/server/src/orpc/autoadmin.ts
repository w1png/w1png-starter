import { db } from "@lunarweb/database";
import { protectedProcedure, publicProcedure } from "./orpc";
import { DEFAULT_TTL, InvalidateCached, ServeCached } from "@lunarweb/redis";
import { z, type ZodObject } from "zod/v4";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import {
	desc,
	eq,
	getTableColumns,
	isNull,
	type InferInsertModel,
} from "drizzle-orm";

export function createAutoAdminRouter<
	TTable extends PgTable & {
		id: PgColumn;
		serial: PgColumn;
		deletedAt: PgColumn;
		createdAt: PgColumn;
	},
	TSchema extends ZodObject & {
		_output: InferInsertModel<TTable>;
	},
	TAdditionalRoutes extends object,
>({
	schema,
	table,
	cacheKey,
	additionalRoutes,
}: {
	schema: TSchema;
	table: TTable;
	cacheKey: string;
	additionalRoutes?: TAdditionalRoutes;
}) {
	return {
		create: protectedProcedure.input(schema).handler(async ({ input }) => {
			await db.insert(table).values(input);
			await InvalidateCached([cacheKey]);
		}),
		update: protectedProcedure
			.input(schema.extend({ id: z.string() }))
			.handler(async ({ input }) => {
				await db.update(table).set(input).where(eq(table.id, input.id));
				await InvalidateCached([cacheKey]);
			}),
		delete: protectedProcedure
			.input(
				z.object({
					id: z.string(),
				}),
			)
			.handler(async ({ input }) => {
				await db.delete(table).where(eq(table.id, input.id));
				await InvalidateCached([cacheKey]);
			}),
		getAll: publicProcedure.handler(async () =>
			ServeCached([cacheKey], DEFAULT_TTL, async () => {
				return db
					.select({
						...getTableColumns(table),
					})
					.from(table)
					.where(isNull(table.deletedAt))
					.orderBy(desc(table.createdAt));
			}),
		),
		...additionalRoutes,
	};
}
