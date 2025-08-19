import { ORPCError, os } from "@orpc/server";
import type { ORPCContext } from "./context";

export const o = os.$context<ORPCContext>();

export const publicProcedure = o;

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
