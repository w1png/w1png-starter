import { expect, vi } from "vitest";
import { FileService, MAX_FILE_SIZE } from "@lunarweb/files";
import { test } from "./fixtures";

function storageDouble() {
	const object = { write: vi.fn(), stream: vi.fn(), stat: vi.fn() };
	return { object, storage: { file: vi.fn().mockReturnValue(object) } };
}

test("stores file metadata and bytes", async ({ resources }) => {
	const { storage, object } = storageDouble();
	const service = new FileService({ context: resources.context, storage });
	const id = await service.upload(new File(["hello"], "hello.txt"));
	expect(await service.metadata(id)).toMatchObject({
		id,
		name: "hello.txt",
		size: 5,
		contentType: "text/plain",
	});
	expect(object.write).toHaveBeenCalledWith(new TextEncoder().encode("hello"), {
		type: "text/plain",
	});
});
test("rejects oversized files before persistence", async ({ resources }) => {
	const { storage, object } = storageDouble();
	const service = new FileService({ context: resources.context, storage });
	await expect(
		service.upload(new File([new Uint8Array(MAX_FILE_SIZE + 1)], "large.txt")),
	).rejects.toThrow("5 MiB");
	expect(await resources.context.db.connection.query.files.findMany()).toEqual(
		[],
	);
	expect(object.write).not.toHaveBeenCalled();
});
test("removes metadata when object storage fails", async ({ resources }) => {
	const { storage, object } = storageDouble();
	object.write.mockRejectedValue(new Error("storage unavailable"));
	const service = new FileService({ context: resources.context, storage });
	await expect(
		service.upload(new File(["hello"], "hello.txt")),
	).rejects.toThrow("storage unavailable");
	expect(await resources.context.db.connection.query.files.findMany()).toEqual(
		[],
	);
});
