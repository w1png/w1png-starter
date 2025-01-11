import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";
import { redis } from "../redis";
import { s3 } from "../s3";
import { auth } from "../auth/auth";
import { logger } from "~/lib/server/logger";
import { env } from "~/env";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers: opts.headers });

  return {
    db,
    redis,
    s3,
    session,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const loggingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  try {
    const result = await next();
    const end = Date.now();
    const duration_ms = end - start;
    logger.info({ path, start, end, duration_ms });
    return result;
  } catch (error) {
    const end = Date.now();
    const duration = end - start;
    logger.error({
      path,
      start,
      end,
      duration,
      error: (error as Error | TRPCError).message,
    });
    if (env.NODE_ENV === "development") {
      throw error;
    }

    if (
      error instanceof TRPCError ||
      (env.NODE_ENV as "production" | "test" | "development") === "development"
    ) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Неизвестная ошибка сервера",
    });
  }
});

export const publicProcedure = t.procedure.use(loggingMiddleware);

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "admin") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});
