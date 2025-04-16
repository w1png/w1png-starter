import { eq } from "drizzle-orm";
import Elysia, { error, t } from "elysia";
import mime from "mime-types";
import { getPlaiceholder } from "plaiceholder";
import sharp from "sharp";
import { db } from "~/server/db";
import { files } from "~/server/db/schema";
import { s3 } from "~/server/s3";
import { userService } from "./user";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function UploadFile({
  file,
  isImage,
}: {
  file: File;
  isImage: boolean;
}) {
  const arrayBuffer = await file.arrayBuffer();
  let buf = Buffer.from(arrayBuffer);

  if (isImage) {
    buf = await sharp(buf).webp().toBuffer();
  }

  const placeholder = isImage ? (await getPlaiceholder(buf)).base64 : undefined;

  const mimeType = mime.extension(file.name);
  const resolvedMimeType = mimeType ? mimeType : "application/octet-stream";

  let id: string | undefined;
  await db.transaction(async (trx) => {
    const [f] = await trx
      .insert(files)
      .values({
        fileName: file.name,
        fileSize: file.size,
        contentType: resolvedMimeType,
        placeholder,
      })
      .returning();

    id = f!.id;

    const metadata = s3.file(id);
    await metadata.write(buf, {
      type: resolvedMimeType,
    });
  });

  return id!;
}

export const fileRouter = new Elysia({ prefix: "/file" }).use(userService).get(
  "/:id",
  async ({ params, set }) => {
    const file = await db.query.files.findFirst({
      where: eq(files.id, params.id),
    });

    if (!file) {
      return error(404, "Файл не найден");
    }

    set.headers["Content-Type"] = file.contentType;
    set.headers["Content-Disposition"] =
      `attachment; filename="${encodeURIComponent(file.fileName)}"`;
    return s3.file(file.id).stream();
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  },
);
