import { ORPCError, os } from "@orpc/server";
import type { ORPCContext } from "./context";
import { logger } from "@lunarweb/logger";
import type { UserRole } from "@lunarweb/shared/schemas";

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

export const roleProcedure = (roles: UserRole[]) => {
	return protectedProcedure.use(async ({ context, next, path }) => {
		if (roles.includes(context.session.user.role)) {
			throw new ORPCError("FORBIDDEN", {
				message: `User has role: ${context.session.user.role} but ${roles.join(", ")} are required for ${path.join(".")}`,
			});
		}
		return next({
			context: {
				session: context.session,
			},
		});
	});
};

export const protectedProcedure = publicProcedure.use(requireAuth);
