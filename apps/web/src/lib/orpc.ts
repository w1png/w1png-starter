import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { toast } from "sonner";
// @ts-ignore
import type { AppRouter } from "../../../server/src/orpc/routers";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(`Ошибка: ${error.message}`);
			console.log({ error });
		},
	}),
	mutationCache: new MutationCache({
		onError: (error) => {
			toast.error(`Ошибка: ${error.message}`);
			console.log({ error });
		},
	}),
});

export const getClientLink = createIsomorphicFn()
	.client(
		() =>
			new RPCLink({
				url: `${import.meta.env.VITE_SERVER_URL}/rpc`,
				fetch(request, options) {
					return fetch(request, {
						...options,
						credentials: "include",
					});
				},
			}),
	)
	.server(
		() =>
			new RPCLink({
				url: `${import.meta.env.VITE_SERVER_URL_INTERNAL}/rpc`,
				headers: () => {
					return getRequest().headers;
				},
				fetch(request, options) {
					try {
						return fetch(request, {
							...options,
							credentials: "include",
						});
					} catch (error) {
						console.error({ error });
						throw error;
					}
				},
			}),
	);

export const client: RouterClient<AppRouter> = createORPCClient(
	getClientLink(),
);

export const orpc = createTanstackQueryUtils(client);
