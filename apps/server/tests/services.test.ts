import { expect, vi } from "vitest";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { NotFoundError } from "../src/services/crud";
import { TestService } from "../src/services/test";
import { UserService } from "../src/services/user";
import { test } from "./fixtures";

const input = {
	id: "one",
	name: "Example",
	bool: false,
	arr: ["a"],
	imageId: "image",
	imageIds: [],
};

test("service persists CRUD and handles missing records", async ({
	resources,
}) => {
	const service = new TestService({ context: resources.context });
	expect(await service.create(input)).toMatchObject(input);
	expect(await service.getAll()).toHaveLength(1);
	expect(await service.update("one", { name: "Changed" })).toMatchObject({
		name: "Changed",
		bool: false,
	});
	expect((await service.get("one")).createdAt).toBeInstanceOf(Date);
	await service.delete("one");
	expect(await service.getAll()).toEqual([]);
	await expect(service.get("one")).rejects.toBeInstanceOf(NotFoundError);
	await expect(
		service.update("one", { name: "missing" }),
	).rejects.toBeInstanceOf(NotFoundError);
	await expect(service.delete("one")).rejects.toBeInstanceOf(NotFoundError);
});

test("bootstrap creates a usable credential once, even when concurrent", async ({
	resources,
}) => {
	const service = new UserService({
		context: resources.context,
		hashPassword,
	});
	const credentials = {
		email: "admin@example.com",
		password: "test-password-123",
	};
	await Promise.all([
		service.ensureMainAdmin(credentials),
		service.ensureMainAdmin(credentials),
	]);
	const users = await resources.database.client.unsafe(
		`SELECT * FROM "${resources.prefix}user"`,
	);
	const accounts = await resources.database.client.unsafe(
		`SELECT * FROM "${resources.prefix}account"`,
	);
	expect(users).toHaveLength(1);
	expect(users[0].role).toBe("ADMIN");
	expect(accounts).toHaveLength(1);
	expect(accounts[0].user_id).toBe(users[0].id);
	expect(
		await verifyPassword({
			hash: accounts[0].password,
			password: credentials.password,
		}),
	).toBe(true);
	const hasher = vi.fn(hashPassword);
	await new UserService({
		context: resources.context,
		hashPassword: hasher,
	}).ensureMainAdmin(credentials);
	expect(hasher).not.toHaveBeenCalled();
});

test("isolated resources allow identical IDs and independent Redis keys", async ({
	resources,
}) => {
	const service = new TestService({ context: resources.context });
	expect(await service.getAll()).toEqual([]);
	await service.create(input);
	const key = `${resources.prefix}session`;
	expect(await resources.redis.client.get(key)).toBeNull();
	await resources.redis.client.set(key, "value", { EX: 30 });
	expect(await resources.redis.client.get(key)).toBe("value");
});

test("does not replace or elevate an existing account", async ({
	resources,
}) => {
	const db = resources.context.db;
	const now = new Date();
	await db.connection.insert(db.tables.user).values({
		id: "existing",
		name: "Existing",
		email: "admin@example.com",
		role: "USER",
		emailVerified: false,
		createdAt: now,
		updatedAt: now,
	});
	const hashPassword = vi.fn();
	await new UserService({
		context: resources.context,
		hashPassword,
	}).ensureMainAdmin({ email: "admin@example.com", password: "secret" });
	expect(hashPassword).not.toHaveBeenCalled();
	expect(await db.connection.query.user.findFirst()).toMatchObject({
		id: "existing",
		role: "USER",
	});
	expect(await db.connection.query.account.findMany()).toEqual([]);
});
test("only persists the password hash", async ({ resources }) => {
	const hashPassword = vi.fn().mockResolvedValue("hash");
	await new UserService({
		context: resources.context,
		hashPassword,
	}).ensureMainAdmin({ email: "admin@example.com", password: "secret" });
	expect(hashPassword).toHaveBeenCalledWith("secret");
	expect(
		await resources.context.db.connection.query.account.findFirst(),
	).toMatchObject({ password: "hash", providerId: "credential" });
});
