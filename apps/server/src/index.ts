// import { cron } from "@elysiajs/cron";

import "dotenv/config";
import { cors } from "@elysiajs/cors";
import { RPCHandler } from "@orpc/server/fetch";
import { ResponseHeadersPlugin } from "@orpc/server/plugins";
import { Elysia } from "elysia";
import { appRouter } from "./orpc/routers";
import { ApiLogger } from "./api-logger";
import { env } from "@lunarweb/env";
import { auth } from "./auth/auth";
import { createContext } from "./orpc/context";
import { fileRouter } from "./orpc/routers/file";

const handler = new RPCHandler(appRouter, {
	plugins: [new ResponseHeadersPlugin()],
});

const app = new Elysia()
	.onError(ApiLogger)
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
