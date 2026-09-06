import { TestSchema, UpdateTestSchema } from "@lunarweb/shared/schemas";
import type { Context } from "../../context";
import type { TestEntity } from "../../services/test";
import { TestService } from "../../services/test";
import { AutoAdmin } from "../autoadmin";
import { publicProcedure } from "../procedures";

export class TestRouter extends AutoAdmin<
	typeof TestSchema,
	typeof UpdateTestSchema,
	TestEntity,
	TestService
> {
	constructor({ context }: { context: Context }) {
		super({
			context,
			createSchema: TestSchema,
			updateSchema: UpdateTestSchema,
			Service: TestService,
		});
	}
	readonly rpc = { ...this.router, foo: publicProcedure.handler(() => "foo") };
}
