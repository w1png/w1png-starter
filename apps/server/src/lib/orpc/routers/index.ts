import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";

export const appRouter = {};
export type AppRouter = typeof appRouter;
export type AppRouterOutputs = InferRouterOutputs<AppRouter>;
export type AppRouterInputs = InferRouterInputs<AppRouter>;
