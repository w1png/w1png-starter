import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";
import { testRouter } from "./test";
import { userRouter } from "./user";

export const appRouter = {
	user: userRouter,
	test: testRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterOutputs = InferRouterOutputs<AppRouter>;
export type AppRouterInputs = InferRouterInputs<AppRouter>;
