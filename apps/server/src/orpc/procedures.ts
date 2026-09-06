import { ORPCError, os } from "@orpc/server";
import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";
import type { Auth } from "../auth";
import { NotFoundError } from "../services/crud";

export interface ORPCContext extends ResponseHeadersPluginContext {
	session: Awaited<ReturnType<Auth["auth"]["api"]["getSession"]>>;
	logger: { error(error: unknown): unknown };
}

export const publicProcedure = os
	.$context<ORPCContext>()
	.use(async ({ context, next }) => {
		try {
			return await next();
		} catch (error) {
			if (error instanceof NotFoundError) throw new ORPCError("NOT_FOUND");
			if (!(error instanceof ORPCError)) context.logger.error(error);
			throw error;
		}
	});
export const protectedProcedure = publicProcedure.use(
	async ({ context, next }) => {
		if (!context.session?.user) throw new ORPCError("UNAUTHORIZED");
		return next({ context: { session: context.session } });
	},
);
export const adminProcedure = protectedProcedure.use(
	async ({ context, next }) => {
		if (context.session.user.role !== "ADMIN") throw new ORPCError("FORBIDDEN");
		return next();
	},
);
