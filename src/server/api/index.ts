import { Elysia } from "elysia";
import { headers as getNextHeaders } from "next/headers";
import { fileRouter } from "./routers/file";
import betterAuthView from "../auth/auth-view";
import { treaty } from "@elysiajs/eden";
import { userRouter } from "./routers/user";
import { logger } from "../logger";

export const app = new Elysia({ prefix: "/api" })
  .onTransform(function log({ path, request: { method } }) {
    logger.info({
      path,
      method,
    });
  })
  .use(userRouter)
  .all("/auth/*", betterAuthView)
  .use(fileRouter);

export type App = typeof app;
export const api = treaty(app);

export async function headers(): Promise<Record<string, string | undefined>> {
  const h = await getNextHeaders();
  const headers: Record<string, string | undefined> = {};
  for (const [key, value] of h.entries()) {
    headers[key] = value;
  }
  return headers;
}
