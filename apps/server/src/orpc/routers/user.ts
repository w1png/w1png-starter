import { publicProcedure } from "../orpc";

export const userRouter = {
	session: {
		get: publicProcedure.handler(async ({ context }) => context.session),
	},
};
