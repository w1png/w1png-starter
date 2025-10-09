import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import Loader from "@/components/loader";
import { Toaster } from "@/components/ui/sonner";
import type { Session } from "@/lib/types/user";
import type { orpc } from "@/utils/orpc";
import appCss from "../index.css?url";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
	session: Session | null;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	async beforeLoad(ctx) {
		const session = await ctx.context.orpc.user.session.get.call();
		console.log({
			user: ctx.context.session
				? {
						id: ctx.context.session.user.id,
						name: ctx.context.session.user.name,
						email: ctx.context.session.user.email,
					}
				: undefined,
			path: ctx.location.href,
		});
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
				title: "app",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
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
		<html lang="en" className="dark">
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
