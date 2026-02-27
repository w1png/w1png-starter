import type { orpc } from "@/lib/orpc";
import { ZodArray, ZodNullable, ZodOptional, type ZodType } from "zod/v4";

export type HasAdminMethods<T> = T extends {
	getAll: unknown;
	create: unknown;
	update: unknown;
	delete: unknown;
}
	? true
	: false;

export type AppRouter = typeof orpc;

export type AdminRouterKeys = {
	[K in keyof AppRouter]: HasAdminMethods<AppRouter[K]> extends true
		? K
		: never;
}[keyof AppRouter];

export type CreateInput<T extends AdminRouterKeys> = Parameters<
	AppRouter[T]["create"]["call"]
>["0"];

export type GetOutput<T extends AdminRouterKeys> = Awaited<
	ReturnType<AppRouter[T]["getAll"]["call"]>
>[number];

export function getRealZodType(zodType: ZodType) {
	if (zodType instanceof ZodNullable || zodType instanceof ZodOptional) {
		return getRealZodType(zodType.unwrap() as ZodType);
	}

	if (zodType instanceof ZodArray) {
		return getRealZodType(zodType.element as ZodType);
	}

	return zodType;
}
