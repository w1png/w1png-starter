import { z } from "zod/v4";

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	REDIS_URL: z.string().url(),

	S3_REGION: z.string(),
	S3_ENDPOINT: z.string(),
	S3_ACCESS_KEY: z.string(),
	S3_SECRET_KEY: z.string(),

	CORS_COOKIE_DOMAIN: z.string(),
	FRONTEND_URL: z.string(),
	BETTER_AUTH_SECRET: z.string(),
	BACKEND_URL: z.string(),

	MAIN_ADMIN_EMAIL: z.string().email(),
	MAIN_ADMIN_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);
