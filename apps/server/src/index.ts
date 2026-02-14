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
import { fileRouter } from "@lunarweb/files";

const handler = new RPCHandler(appRouter, {
	plugins: [new ResponseHeadersPlugin()],
});

const _app = new Elysia()
	.onError(ApiLogger)
	.use(
		cors({
			origin: env.FRONTEND_URL || "",
			methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.mount(auth.handler)
	.use(fileRouter)
	.all("/rpc*", async (context) => {
		const { response } = await handler.handle(context.request, {
			prefix: "/rpc",
			context: await createContext({ context }),
		});
		return response ?? new Response("Not Found", { status: 404 });
	})
	.listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});
