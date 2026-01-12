import { ORPCError, os } from "@orpc/server";
import type { ORPCContext } from "./context";
import { logger } from "@lunarweb/logger";

export const o = os.$context<ORPCContext>();

const errorLogger = o.middleware(async ({ context, next }) => {
	try {
		return await next({ context });
	} catch (error) {
		logger.error(error);
		throw error;
	}
});

export const publicProcedure = o.use(errorLogger);

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({
		context: {
			session: context.session,
		},
	});
});

export const protectedProcedure = publicProcedure.use(requireAuth);
