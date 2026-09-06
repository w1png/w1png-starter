import type { InferSchemaOutput } from "@orpc/server";
import { z } from "zod";
import type { Context } from "../context";
import type { CrudService } from "../services/crud";
import { adminProcedure } from "./procedures";

const idSchema = z.compile(z.object({ id: z.string().min(1) }));

export class AutoAdmin<
	Create extends z.ZodType,
	Update extends z.ZodType,
	Entity,
	Service extends CrudService<
		InferSchemaOutput<Create>,
		InferSchemaOutput<Update>,
		Entity
	>,
> {
	readonly service: Service;
	readonly router;
	constructor({
		context,
		createSchema,
		updateSchema,
		Service,
	}: {
		context: Context;
		createSchema: Create;
		updateSchema: Update;
		Service: new ({ context }: { context: Context }) => Service;
	}) {
		this.service = new Service({ context });
		this.router = {
			create: adminProcedure
				.input(z.compile(createSchema))
				.handler(({ input }) => this.service.create(input)),
			update: adminProcedure
				.input(
					z.compile(z.object({ id: z.string().min(1), data: updateSchema })),
				)
				.handler(({ input }) => {
					// Zod cannot simplify generic object outputs; the enclosing schema validates both fields.
					const update = input as {
						id: string;
						data: InferSchemaOutput<Update>;
					};
					return this.service.update(update.id, update.data);
				}),
			delete: adminProcedure
				.input(idSchema)
				.handler(({ input }) => this.service.delete(input.id)),
			get: adminProcedure
				.input(idSchema)
				.handler(({ input }) => this.service.get(input.id)),
			getAll: adminProcedure.handler(() => this.service.getAll()),
		};
	}
}
