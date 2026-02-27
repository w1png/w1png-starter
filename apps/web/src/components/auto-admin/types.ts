import type { orpc } from "@/lib/orpc";
import type { Item } from "@/lib/types/utils";
import type { ReactNode } from "@types/react";
import {
	ZodArray,
	ZodNullable,
	type ZodObject,
	ZodOptional,
	type ZodType,
} from "zod/v4";

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

export type FieldConfigs<S extends ZodObject> = {
	fields?: {
		[K in keyof S["shape"]]?: FieldConfig<GetZodFieldTypeByKey<S, K>>;
	};
	actions?: {
		delete?: boolean;
		update?: boolean;
		additionalActions?: ReactNode[];
	};
};

export type GetZodFieldTypeByKey<
	S extends ZodObject,
	K extends keyof SShape,
	SShape = S["shape"],
> = SShape[K];

export type FieldConfig<
	ZT extends ZodType,
	TypescriptType = ZT["_zod"]["output"],
> = {
	label?: string;
	placeholder?: string;
	noDelete?: boolean;
	noUpdate?: boolean;
	fileType?: string;
} & (TypescriptType extends string | string[]
	?
			| {
					selectFrom?: () => PromiseLike<Item[]>;
					type?:
						| "file"
						| (TypescriptType extends string ? "string" : "string[]");
			  }
			| {
					selectFrom?: never;
					type?: never;
			  }
	: TypescriptType extends boolean
		? {
				selectFrom?: never;
				type?: "checkbox" | "switch";
			}
		: {
				selectFrom?: never;
				type?: never;
			});

export function getRealZodType(zodType: ZodType) {
	if (zodType instanceof ZodNullable || zodType instanceof ZodOptional) {
		return getRealZodType(zodType.unwrap() as ZodType);
	}

	if (zodType instanceof ZodArray) {
		return getRealZodType(zodType.element as ZodType);
	}

	return zodType;
}
