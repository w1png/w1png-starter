import { test, expect } from "bun:test";
import { CreateUser, setupCaller } from "~/tests/caller";
import { MAX_FILE_SIZE_MB, type ProcessedFile } from "~/lib/shared/types/file";
import type { Session } from "~/server/auth/auth";

const testFile: ProcessedFile = {
  fileName: "test.png",
  contentType: "image/png",
  fileSize: 100,
  b64: Buffer.from(Array.from({ length: 100 }).fill("a").join("")).toString(
    "base64",
  ),
};

test("file.create", async () => {
  const { user } = await CreateUser();

  const caller = setupCaller({
    headers: new Headers(),
    session: {
      session: user.user,
      user: {
        ...user.user,
        banned: false,
      },
    } as unknown as Session,
  });

  const { id } = await caller.file.create(testFile);
  expect(id).toBeTruthy();
});

test("file.create-max-file-size", async () => {
  const testHugeFile: ProcessedFile = {
    fileName: "test.png",
    contentType: "image/png",
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 + 1,
    b64: Buffer.from(
      Array.from({ length: MAX_FILE_SIZE_MB * 1024 * 1024 + 1 })
        .fill("a")
        .join(""),
    ).toString("base64"),
  };

  const { user } = await CreateUser();

  const caller = setupCaller({
    headers: new Headers(),
    session: {
      session: user.user,
      user: {
        ...user.user,
        banned: false,
      },
    } as unknown as Session,
  });

  expect(async () => {
    await caller.file.create(testHugeFile);
  }).toThrow();
});

test("file.create-unauthorized", () => {
  const caller = setupCaller({ headers: new Headers(), session: null });
  expect(async () => {
    await caller.file.create(testFile);
  }).toThrow();
});
