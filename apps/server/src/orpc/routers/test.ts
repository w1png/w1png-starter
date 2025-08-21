import { protectedProcedure } from "../orpc";

export const testRouter = {
	get: protectedProcedure.handler(async () => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return "Hello World";
	}),
};
