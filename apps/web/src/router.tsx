import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import ErrorComponent from "./components/error";
import NotFound from "./components/not-found";
import { routeTree } from "./routeTree.gen";
import { orpc, queryClient } from "@/lib/orpc";

export const getRouter = () => {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 1000,
		context: { orpc, queryClient, session: null },
		defaultViewTransition: true,
		defaultNotFoundComponent: () => <NotFound />,
		defaultErrorComponent: ({ error, reset }) => {
			console.error(error);

			return <ErrorComponent error={error} reset={reset} />;
		},
		defaultPreload: "intent",
		Wrap: ({ children }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		),
	});
	return router;
};

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
