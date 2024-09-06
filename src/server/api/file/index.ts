import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { fileRouter } from "./routers/file";

export const router = createTRPCRouter({
  file: fileRouter,
});

export type Router = typeof router;
export const createCaller = createCallerFactory(router);
