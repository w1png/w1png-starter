import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/user";

export const router = createTRPCRouter({
  user: userRouter,
});

export type Router = typeof router;
export const createCaller = createCallerFactory(router);
