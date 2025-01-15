import { describe, expect, test } from "bun:test";
import fs from "fs";
import { api } from "~/server/api";
import { MAX_FILE_SIZE } from "~/server/api/routers/file";
import { CreateUser } from "~/tests/create-user";
import { FileFromBuffer } from "~/tests/utils";

const testFile = FileFromBuffer(Buffer.from("test"), "test.txt");
const testBigFile = FileFromBuffer(
  Buffer.from(
    Array.from({ length: MAX_FILE_SIZE + 1 })
      .fill(1)
      .join(""),
  ),
  "test.txt",
);
const testImage = FileFromBuffer(
  fs.readFileSync("./src/tests/test.jpg"),
  "test.jpg",
);

describe("file", () => {
  test("get.notFound", async () => {
    const file = await api.api.file({ id: "123" }).get();
    expect(file.error?.status).toBe(404);
  });

  test("create.notImage", async () => {
    const { headers } = await CreateUser();

    const file = await api.api.file.index.post(
      { file: testFile },
      { headers, query: { isImage: false } },
    );
    expect(file.error).toBeFalsy();
    expect(file.data).toBeTruthy();
  });

  test("get.unauthorized", async () => {
    const { headers } = await CreateUser();

    const uploadedFile = await api.api.file.index.post(
      { file: testFile },
      { headers, query: { isImage: false } },
    );
    expect(uploadedFile.data).toBeTruthy();

    const file = await api.api.file({ id: uploadedFile.data!.id }).get();
    expect(file.response.headers.get("Content-Type")).toBe(
      "application/octet-stream, text/event-stream; charset=utf-8",
    );
    expect(file.response.headers.get("Content-Disposition")).toBe(
      `attachment; filename="test.txt"`,
    );
    expect(file.error).toBeFalsy();
    expect(file.data).toBeTruthy();
  });

  test("get.autorized", async () => {
    const { headers } = await CreateUser();

    const uploadedFile = await api.api.file.index.post(
      { file: testFile },
      { headers, query: { isImage: false } },
    );
    expect(uploadedFile.data).toBeTruthy();

    const file = await api.api
      .file({ id: uploadedFile.data!.id })
      .get({ headers });
    expect(file.response.headers.get("Content-Type")).toBe(
      "application/octet-stream, text/event-stream; charset=utf-8",
    );
    expect(file.response.headers.get("Content-Disposition")).toBe(
      `attachment; filename="test.txt"`,
    );
    expect(file.data as unknown as string).toBe("test");
    expect(file.error).toBeFalsy();
    expect(file.data).toBeTruthy();
  });

  test("create.image", async () => {
    const { headers } = await CreateUser();

    const file = await api.api.file.index.post(
      { file: testImage },
      { headers, query: { isImage: true } },
    );
    expect(file.error).toBeFalsy();
    expect(file.data).toBeTruthy();
    expect(file.data).toHaveProperty("id");
  });

  test("create.image.invalid", async () => {
    const { headers } = await CreateUser();

    const res = await api.api.file.index.post(
      { file: testFile },
      { headers, query: { isImage: true } },
    );
    expect(res.error).toBeTruthy();
    expect(res.data).toBeFalsy();
  });

  test("create.image.tooBig", async () => {
    const { headers } = await CreateUser();

    const res = await api.api.file.index.post(
      { file: testBigFile },
      { headers, query: { isImage: true } },
    );
    expect(res.error).toBeTruthy();
    expect(res.data).toBeFalsy();
  });
});
