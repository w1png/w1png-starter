import type { RegisteredRouter } from "@tanstack/react-router";
import type {
	AllContext,
	FullSearchSchema,
	ResolveParams,
	RoutePaths,
} from "@tanstack/router-core";

export type FullSearchParams = FullSearchSchema<RegisteredRouter["routeTree"]>;
export type SearchKeys = keyof NonNullable<FullSearchParams>;

export type Context = AllContext<RegisteredRouter["routeTree"]>;

export type RoutePath = RoutePaths<RegisteredRouter["routeTree"]>;
export type ParamsForRoute<T extends RoutePath> = ResolveParams<T>;

export type Item =
	| {
			id: string;
			name: string;
			title?: string | null;
	  }
	| {
			id: string;
			name?: string | null;
			title: string;
	  };
