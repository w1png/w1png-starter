import { TestSchema } from "@lunarweb/shared/schemas";
import { tests } from "@lunarweb/database/schema";
import { createAutoAdminRouter } from "../autoadmin";

export const testRouter = createAutoAdminRouter({
	schema: TestSchema,
	table: tests,
	cacheKey: "test",
});
