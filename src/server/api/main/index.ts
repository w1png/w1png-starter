import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { templateRouter } from "./routers/template";

export const router = createTRPCRouter({
  template: templateRouter,
});

export type Router = typeof router;
export const createCaller = createCallerFactory(router);
