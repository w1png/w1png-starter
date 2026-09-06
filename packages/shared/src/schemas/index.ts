import { z } from "zod/v4";

export * from "./user";

export const TestSchema = z.object({
	id: z.string().min(1),
	name: z.string().trim().min(1),
	bool: z.boolean(),
	arr: z.array(z.string()),
	imageId: z.string(),
	imageIds: z.array(z.string()),
});

export const UpdateTestSchema = TestSchema.omit({ id: true }).partial();
export const TestEntitySchema = TestSchema.extend({
	serial: z.number().int(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

export type CreateTest = z.infer<typeof TestSchema>;
export type UpdateTest = z.infer<typeof UpdateTestSchema>;
export type TestEntity = z.infer<typeof TestEntitySchema>;
