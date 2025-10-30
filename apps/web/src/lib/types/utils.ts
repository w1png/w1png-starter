import type { RegisteredRouter } from "@tanstack/react-router";
import type {
	FullSearchSchema,
	AllContext,
	RoutePaths,
	ResolveParams,
} from "@tanstack/router-core";

export type FullSearchParams = FullSearchSchema<RegisteredRouter["routeTree"]>;
export type SearchKeys = keyof NonNullable<FullSearchParams>;

export type Context = AllContext<RegisteredRouter["routeTree"]>;

export type RoutePath = RoutePaths<RegisteredRouter["routeTree"]>;
export type ParamsForRoute<T extends RoutePath> = ResolveParams<T>;
