import type { CreateTest, UpdateTest } from "@lunarweb/shared/schemas";
export type {
	CreateTest,
	UpdateTest,
	TestEntity,
} from "@lunarweb/shared/schemas";
import type { Context } from "../context";
import { and, desc, eq, isNull } from "drizzle-orm";
import { NotFoundError } from "./crud";

export class TestService {
	private readonly context;
	private readonly table;
	constructor({ context }: { context: Context }) {
		this.context = context;
		this.table = context.db.tables.tests;
	}
	async create(input: CreateTest) {
		const [entity] = await this.context.db.connection
			.insert(this.table)
			.values(input)
			.returning();
		if (!entity) throw new Error("Insert returned no resource");
		return entity;
	}
	async update(id: string, input: UpdateTest) {
		const [entity] = await this.context.db.connection
			.update(this.table)
			.set({ ...input, updatedAt: new Date() })
			.where(this.active(id))
			.returning();
		if (!entity) throw new NotFoundError();
		return entity;
	}
	async delete(id: string) {
		const rows = await this.context.db.connection
			.delete(this.table)
			.where(this.active(id))
			.returning({ id: this.table.id });
		if (!rows.length) throw new NotFoundError();
	}
	async get(id: string) {
		const entity = await this.context.db.connection.query.tests.findFirst({
			where: this.active(id),
		});
		if (!entity) throw new NotFoundError();
		return entity;
	}
	getAll() {
		return this.context.db.connection.query.tests.findMany({
			where: isNull(this.table.deletedAt),
			orderBy: desc(this.table.createdAt),
		});
	}
	private active(id: string) {
		return and(eq(this.table.id, id), isNull(this.table.deletedAt));
	}
}
