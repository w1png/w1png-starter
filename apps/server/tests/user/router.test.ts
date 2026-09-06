import { call } from "@orpc/server";
import { expect, test, vi } from "vitest";
import type { ORPCContext } from "../../src/orpc/procedures";
import { UserRouter } from "../../src/orpc/routers/user";

test("returns the current session", async () => {
	const context: ORPCContext = {
		logger: { error: vi.fn() },
		session: null,
	};

	expect(
		await call(new UserRouter().rpc.session.get, undefined, { context }),
	).toBeNull();
});
