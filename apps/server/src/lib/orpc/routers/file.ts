import { files } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Elysia, { status, t } from "elysia";
import mime from "mime-types";
import sharp from "sharp";
import { db } from "@/lib/db";
import { s3 } from "@/lib/s3";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function UploadFile({
	file,
	isImage,
}: {
	file: File;
	isImage: boolean;
}) {
	const arrayBuffer = await file.arrayBuffer();
	let buf: Buffer<ArrayBufferLike> = Buffer.from(arrayBuffer);

	if (isImage) {
		buf = await sharp(buf).webp().toBuffer();
	}

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

export const fileRouter = new Elysia({ prefix: "/file" }).get(
	"/:id",
	async ({ params, set }) => {
		const file = await db.query.files.findFirst({
			where: eq(files.id, params.id),
		});

		if (!file) {
			return status(404, "Файл не найден");
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
