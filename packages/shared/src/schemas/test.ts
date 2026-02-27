import z from "zod/v4";

export const TestSchema = z.object({
	imageId: z.string(),
	imageIds: z.array(z.string()),
	name: z
		.string({
			message: "somemessage",
		})
		.describe("Название"),
	arr: z.array(z.string()),
	num: z.coerce.number(),
	bool: z.boolean(),
	date: z.date().nullish(),
});
