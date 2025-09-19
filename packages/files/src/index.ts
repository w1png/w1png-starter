import { db } from "@lunarweb/database";
import { files } from "@lunarweb/database/schema";
import { env } from "@lunarweb/env";
import { redis } from "@lunarweb/redis";
import { eq } from "drizzle-orm";
import mime from "mime-types";
import sharp from "sharp";

export const s3 = new Bun.S3Client({
	region: env.S3_REGION,
	endpoint: env.S3_ENDPOINT,
	accessKeyId: env.S3_ACCESS_KEY,
	secretAccessKey: env.S3_SECRET_KEY,
});

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

		console.log({
			"uploading image with id": id,
		});

		console.log({
			res: await metadata.write(buf, {
				type: resolvedMimeType,
			}),
		});
	});

	return id!;
}

export type FileMetadata = {
	id: string;
	fileName: string;
	contentType: string;
	fileSize: number;
};

export async function GetFileMetadata(id: string): Promise<FileMetadata> {
	const cachedMetadata = await redis.get(id);
	if (cachedMetadata) {
		return JSON.parse(cachedMetadata) as FileMetadata;
	}

	const metadata = await db.query.files.findFirst({
		where: eq(files.id, id),
	});

	if (!metadata) {
		throw new Error("File not found");
	}

	await redis.set(id, JSON.stringify(metadata), "EX", 24 * 60 * 60);

	return metadata;
}
