import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { templateRouter } from "./routers/template";
import { fileRouter } from "./routers/file";
import { userRouter } from "./routers/user";

export const router = createTRPCRouter({
  template: templateRouter,
  file: fileRouter,
  user: userRouter,
});

export type Router = typeof router;
export const createCaller = createCallerFactory(router);
