import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";
import { usersRouter } from "./user";
import { testRouter } from "./test";

export const appRouter = {
	users: usersRouter,
	tests: testRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterOutputs = InferRouterOutputs<AppRouter>;
export type AppRouterInputs = InferRouterInputs<AppRouter>;
