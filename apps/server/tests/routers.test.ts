import { call } from "@orpc/server";
import { describe, expect, it, vi } from "vitest";
import { TestRouter } from "../src/orpc/routers/test";
import { UserRouter } from "../src/orpc/routers/user";
import type { ORPCContext } from "../src/orpc/procedures";
import { NotFoundError } from "../src/services/crud";
import { TestService } from "../src/services/test";

const input = {
	id: "one",
	name: " Example ",
	bool: true,
	arr: [],
	imageId: "image",
	imageIds: [],
};
function setup(role: string | null = "ADMIN") {
	const applicationContext = {
		db: { tables: { tests: {} } },
	} as ConstructorParameters<typeof TestRouter>[0]["context"];
	const autoAdmin = new TestRouter({ context: applicationContext });
	const service = autoAdmin.service;
	vi.spyOn(service, "create");
	vi.spyOn(service, "update");
	vi.spyOn(service, "delete");
	vi.spyOn(service, "get");
	vi.spyOn(service, "getAll");
	const context: ORPCContext = {
		logger: { error: vi.fn() },
		session: role
			? {
					user: {
						id: "user",
						name: "User",
						email: "user@example.com",
						emailVerified: true,
						role,
						createdAt: new Date(),
						updatedAt: new Date(),
						image: null,
					},
					session: {
						id: "session",
						userId: "user",
						token: "token",
						expiresAt: new Date(),
						createdAt: new Date(),
						updatedAt: new Date(),
						ipAddress: null,
						userAgent: null,
					},
				}
			: null,
	};
	return { router: autoAdmin.rpc, context, service };
}

describe("AutoAdmin", () => {
	it("constructs its service and CRUD router", () => {
		const { router, service } = setup();
		expect(service).toBeInstanceOf(TestService);
		expect(Object.keys(router)).toEqual([
			"create",
			"update",
			"delete",
			"get",
			"getAll",
			"foo",
		]);
	});

	it("validates and transforms create input before calling the service", async () => {
		const { router, context, service } = setup();
		const create = vi.spyOn(service, "create").mockResolvedValue({
			...input,
			serial: 1,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		});
		await call(router.create, input, { context });
		expect(create).toHaveBeenCalledWith({ ...input, name: "Example" });
		await expect(
			call(router.create, { ...input, name: " " }, { context }),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
		expect(create).toHaveBeenCalledTimes(1);
	});
	it("separates the update ID from partial data and strips protected fields", async () => {
		const { router, context, service } = setup();
		const update = vi.spyOn(service, "update").mockResolvedValue({
			...input,
			serial: 1,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		});
		const updateInput = { id: "one", data: { name: " Changed ", id: "other" } };
		await call(router.update, updateInput, { context });
		expect(update).toHaveBeenCalledWith("one", { name: "Changed" });
	});
	it.each([null, "USER"])("rejects CRUD access for role %s", async (role) => {
		const { router, context, service } = setup(role);
		const code = role ? "FORBIDDEN" : "UNAUTHORIZED";
		await expect(call(router.create, input, { context })).rejects.toMatchObject(
			{ code },
		);
		await expect(
			call(router.getAll, undefined, { context }),
		).rejects.toMatchObject({ code });
		await expect(
			call(router.get, { id: "one" }, { context }),
		).rejects.toMatchObject({ code });
		await expect(
			call(router.update, { id: "one", data: {} }, { context }),
		).rejects.toMatchObject({ code });
		await expect(
			call(router.delete, { id: "one" }, { context }),
		).rejects.toMatchObject({ code });
		expect(service.create).not.toHaveBeenCalled();
		expect(service.update).not.toHaveBeenCalled();
		expect(service.delete).not.toHaveBeenCalled();
		expect(service.get).not.toHaveBeenCalled();
		expect(service.getAll).not.toHaveBeenCalled();
	});
	it("maps missing resources to NOT_FOUND", async () => {
		const { router, context, service } = setup();
		vi.spyOn(service, "get").mockRejectedValue(new NotFoundError());
		await expect(
			call(router.get, { id: "missing" }, { context }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
	it("returns session and custom routes without requiring admin access", async () => {
		const { router, context } = setup(null);
		expect(await call(router.foo, undefined, { context })).toBe("foo");
		expect(
			await call(new UserRouter().rpc.session.get, undefined, { context }),
		).toBeNull();
	});
});

it("delegates reads and deletes and returns the service result", async () => {
	const { router, context, service } = setup();
	const entity = {
		...input,
		serial: 1,
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
	};
	const get = vi.spyOn(service, "get").mockResolvedValue(entity);
	const getAll = vi.spyOn(service, "getAll").mockResolvedValue([entity]);
	const remove = vi.spyOn(service, "delete").mockResolvedValue();
	expect(await call(router.get, { id: "one" }, { context })).toEqual(entity);
	expect(await call(router.getAll, undefined, { context })).toEqual([entity]);
	await call(router.delete, { id: "one" }, { context });
	expect(get).toHaveBeenCalledWith("one");
	expect(getAll).toHaveBeenCalledOnce();
	expect(remove).toHaveBeenCalledWith("one");
});
