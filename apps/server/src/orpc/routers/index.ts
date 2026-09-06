import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";
import type { ORPC } from "../orpc";
export type AppRouter = ORPC["router"];
export type AppRouterOutputs = InferRouterOutputs<AppRouter>;
export type AppRouterInputs = InferRouterInputs<AppRouter>;
