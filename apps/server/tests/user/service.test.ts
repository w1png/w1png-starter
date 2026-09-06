import { hashPassword, verifyPassword } from "better-auth/crypto";
import { expect, vi } from "vitest";
import { UserService } from "../../src/services/user";
import { test } from "../support/fixtures";

const credentials = {
	email: "admin@example.com",
	password: "test-password-123",
};

test("creates a usable credential once when called concurrently", async ({
	resources,
}) => {
	const service = new UserService({
		context: resources.context,
		hashPassword,
	});
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

test("does not replace or elevate an existing account", async ({
	resources,
}) => {
	const db = resources.context.db;
	const now = new Date();
	await db.connection.insert(db.tables.user).values({
		id: "existing",
		name: "Existing",
		email: credentials.email,
		role: "USER",
		emailVerified: false,
		createdAt: now,
		updatedAt: now,
	});
	const hasher = vi.fn();
	await new UserService({
		context: resources.context,
		hashPassword: hasher,
	}).ensureMainAdmin(credentials);

	expect(hasher).not.toHaveBeenCalled();
	expect(await db.connection.query.user.findFirst()).toMatchObject({
		id: "existing",
		role: "USER",
	});
	expect(await db.connection.query.account.findMany()).toEqual([]);
});

test("persists only the password hash", async ({ resources }) => {
	const hasher = vi.fn().mockResolvedValue("hash");
	await new UserService({
		context: resources.context,
		hashPassword: hasher,
	}).ensureMainAdmin(credentials);

	expect(hasher).toHaveBeenCalledWith(credentials.password);
	expect(
		await resources.context.db.connection.query.account.findFirst(),
	).toMatchObject({ password: "hash", providerId: "credential" });
});
