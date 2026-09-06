import { expect } from "vitest";
import { NotFoundError } from "../../src/services/crud";
import { TestService } from "../../src/services/test";
import { test } from "../support/fixtures";

const input = {
	id: "one",
	name: "Example",
	bool: false,
	arr: ["a"],
	imageId: "image",
	imageIds: [],
};

test("persists CRUD and handles missing records", async ({ resources }) => {
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

test("uses isolated database and Redis namespaces", async ({ resources }) => {
	const service = new TestService({ context: resources.context });
	expect(await service.getAll()).toEqual([]);
	await service.create(input);

	const key = `${resources.prefix}session`;
	expect(await resources.redis.client.get(key)).toBeNull();
	await resources.redis.client.set(key, "value", { EX: 30 });
	expect(await resources.redis.client.get(key)).toBe("value");
});
