// import { cron } from "@elysiajs/cron";

import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { RPCHandler } from "@orpc/server/fetch";
import { auth } from "./lib/auth/auth";
import { createContext } from "./lib/orpc/context";
import { env } from "./lib/env";
import { appRouter } from "./lib/orpc/routers";
import { ResponseHeadersPlugin } from "@orpc/server/plugins";
import { fileRouter } from "./lib/orpc/routers/file";
import { ApiErrorLogger } from "./lib/logger/apiLogger";

const handler = new RPCHandler(appRouter, {
	plugins: [new ResponseHeadersPlugin()],
});

const app = new Elysia()
	.onError(ApiErrorLogger)
	// .use(
	// 	cron({
	// 		name: "something",
	// 		pattern: "*/10 * * * * *",
	// 		run: async () => {
	// 			console.log("Cron job ran");
	// 		},
	// 	}),
	// )
	.use(
		cors({
			origin: env.CORS_ORIGIN || "",
			methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.all("/api/auth/*", async (context) => {
		const { request } = context;
		if (["POST", "GET"].includes(request.method)) {
			return auth.handler(request);
		}
		context.status(405);
	})
	.all("/rpc*", async (context) => {
		const { response } = await handler.handle(context.request, {
			prefix: "/rpc",
			context: await createContext({ context }),
		});
		return response ?? new Response("Not Found", { status: 404 });
	})
	.use(fileRouter)
	.listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});
