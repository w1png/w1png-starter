import { TestSchema } from "@lunarweb/shared/schemas";
import { tests } from "@lunarweb/database/schema";
import { createAutoAdminRouter } from "../autoadmin";
import { publicProcedure } from "../orpc";

export const testRouter = createAutoAdminRouter({
	schema: TestSchema,
	table: tests,
	cacheKey: "test",
	additionalRoutes: {
		foo: publicProcedure.handler(async () => {
			return "foo";
		}),
	},
});
