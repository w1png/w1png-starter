import { env } from "../env";

const globalForS3 = globalThis as unknown as {
	s3: Bun.S3Client | undefined;
};

export const s3 =
	globalForS3.s3 ??
	new Bun.S3Client({
		region: env.S3_REGION,
		endpoint: env.S3_ENDPOINT,
		accessKeyId: env.S3_ACCESS_KEY,
		secretAccessKey: env.S3_SECRET_KEY,
	});
