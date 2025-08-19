import { z } from "zod/mini";

export const someSchema = z.object({
	test: z.string(),
});
