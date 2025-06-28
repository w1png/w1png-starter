import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";
import type { Context as ElysiaContext } from "elysia";
import { auth } from "../auth/auth";

export type CreateContextOptions = {
	context: ElysiaContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.request.headers,
	});
	return {
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
export interface ORPCContext extends ResponseHeadersPluginContext, Context {}
