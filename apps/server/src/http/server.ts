import type { Auth } from "../auth";
import type { Context } from "../context";
import type { ORPC } from "../orpc/orpc";
import type { FileRouter } from "@lunarweb/files";
import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";

export class Server {
	readonly instance;
	constructor(
		private readonly dependencies: {
			context: Context;
			orpc: ORPC;
			auth: Auth;
			fileRouter: FileRouter;
		},
	) {
		const { context, orpc, auth, fileRouter } = dependencies;
		this.instance = new Elysia()
			.onError((event) => context.logger.logApi(event))
			.use(
				cors({
					origin: context.env.values.FRONTEND_URL,
					credentials: true,
					methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
					allowedHeaders: ["Content-Type", "Authorization"],
				}),
			)
			.get("/health", () => ({ status: "ok" }))
			.mount(auth.auth.handler)
			.use(fileRouter.http)
			.all("/rpc*", ({ request }) => orpc.handle(request));
	}
	run() {
		this.instance.listen(this.dependencies.context.env.values.PORT);
		this.dependencies.context.logger.info(
			`Server listening on port ${this.dependencies.context.env.values.PORT}`,
		);
	}
	async close() {
		if (this.instance.server) await this.instance.stop();
	}
}
