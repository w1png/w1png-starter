import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";
import { testRouter } from "./test";

export const appRouter = {
	test: testRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterOutputs = InferRouterOutputs<AppRouter>;
export type AppRouterInputs = InferRouterInputs<AppRouter>;
