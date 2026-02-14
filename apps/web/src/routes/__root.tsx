import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import { Toaster } from "@/components/ui/sonner";
import type { Session } from "@/lib/types/user";
import { cn } from "@/lib/utils";
import type { orpc } from "@/lib/orpc";
import appCss from "../index.css?url";
export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
	session: Session | null;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	async beforeLoad(ctx) {
		const session = await ctx.context.orpc.user.session.get.call();
		return {
			session,
		};
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "App",
			},
			{
				name: "description",
				content: "Description",
			},
			{
				name: "og:title",
				content: "App",
			},
			{
				name: "og:description",
				content: "Description",
			},
			{
				name: "og:type",
				content: "website",
			},
			{
				name: "og:url",
				content: import.meta.env.VITE_FRONTEND_URL,
			},
			{ name: "robots", content: "index, follow" },
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{ rel: "icon", href: "/favicon.png", type: "image/png", sizes: "32x32" },
			{ rel: "canonical", href: import.meta.env.VITE_FRONTEND_URL },
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	const [showLoading, setIsFetching] = useState(false);
	const isFetching = useRouterState({ select: (s) => s.isLoading });

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsFetching(isFetching);
		}, 200);
		return () => clearTimeout(timeout);
	}, [isFetching]);

	return (
		<html className="dark" lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<div className="grid h-svh grid-rows-[auto_1fr]">
					<div
						className={cn(
							"fixed text-center h-screen w-screen size-full z-50 backdrop-blur bg-black/10 items-center justify-center flex flex-col gap-4 transition duration-300 ease-in-out",
							showLoading
								? "opacity-100 pointer-events-auto"
								: "opacity-0 pointer-events-none",
						)}
					>
						<div className="text-foreground p-6 rounded-xl flex flex-col gap-4 items-center justify-center">
							<Loader className="h-9" />
						</div>
					</div>
					<Outlet />
				</div>
				<Toaster richColors />
				<Scripts />
			</body>
		</html>
	);
}
