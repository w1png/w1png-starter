import { publicProcedure } from "../procedures";

export class UserRouter {
	readonly rpc = {
		session: { get: publicProcedure.handler(({ context }) => context.session) },
	};
}
