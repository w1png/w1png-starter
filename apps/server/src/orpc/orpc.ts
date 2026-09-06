import { RPCHandler } from "@orpc/server/fetch";
import { ResponseHeadersPlugin } from "@orpc/server/plugins";
import type { Auth } from "../auth";
import type { Context } from "../context";
import type { TestRouter } from "./routers/test";
import type { UserRouter } from "./routers/user";

export class ORPC {
	readonly router;
	readonly handler;
	constructor(
		private readonly dependencies: {
			context: Context;
			auth: Auth;
			testRouter: TestRouter;
			userRouter: UserRouter;
		},
	) {
		this.router = {
			tests: dependencies.testRouter.rpc,
			users: dependencies.userRouter.rpc,
		};
		this.handler = new RPCHandler(this.router, {
			plugins: [new ResponseHeadersPlugin()],
		});
	}
	async handle(request: Request) {
		const session = await this.dependencies.auth.auth.api.getSession({
			headers: request.headers,
		});
		const { response } = await this.handler.handle(request, {
			prefix: "/rpc",
			context: { session, logger: this.dependencies.context.logger },
		});
		return response ?? new Response("Not Found", { status: 404 });
	}
}
