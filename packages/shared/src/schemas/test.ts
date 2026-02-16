import z from "zod/v4";

export const TestSchema = z.object({
	imageId: z.string().describe("FILE;SEO фото"),
	imageIds: z.array(z.string()).describe("FILE;Фотографии"),
	name: z
		.string({
			message: "somemessage",
		})
		.describe("Название"),
	arr: z.array(z.string()).describe("Массив"),
	num: z.coerce.number().describe("Число"),
	bool: z.boolean().describe("Да/нет"),
	date: z.date().nullish().describe("Дата (по желанию)"),
});
