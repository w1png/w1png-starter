import { publicProcedure } from "../orpc";

export const usersRouter = {
	session: {
		get: publicProcedure.handler(async ({ context }) => context.session),
	},
};
