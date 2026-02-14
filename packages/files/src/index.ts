import { db } from "@lunarweb/database";
import { files } from "@lunarweb/database/schema";
import { env } from "@lunarweb/env";
import { DEFAULT_TTL, ServeCached } from "@lunarweb/redis";
import { eq } from "drizzle-orm";
import mime from "mime-types";

export const s3 = new Bun.S3Client({
	region: env.S3_REGION,
	endpoint: env.S3_ENDPOINT,
	accessKeyId: env.S3_ACCESS_KEY,
	secretAccessKey: env.S3_SECRET_KEY,
});

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function UploadFile({ file }: { file: File }) {
	const mimeType = mime.lookup(file.name);
	const resolvedMimeType = mimeType ? mimeType : "application/octet-stream";

	const [f] = await db
		.insert(files)
		.values({
			name: file.name,
			size: file.size,
			contentType: resolvedMimeType,
		})
		.returning({ id: files.id });

	const id = f?.id;

	if (!id) {
		throw new Error("Failed to upload file");
	}

	const metadata = s3.file(id);

	await metadata.write(Buffer.from(await file.arrayBuffer()), {
		type: resolvedMimeType,
	});

	return id;
}

export async function GetFileMetadata(id: string) {
	const meta = await ServeCached(["file", id], DEFAULT_TTL, async () =>
		db.query.files.findFirst({
			where: eq(files.id, id),
		}),
	);

	if (!meta) {
		throw new Error("File not found");
	}

	return meta;
}

export * from "./router";
