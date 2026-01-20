import { z } from "zod/v4";

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	REDIS_URL: z.string().url(),

	S3_REGION: z.string(),
	S3_ENDPOINT: z.string(),
	S3_ACCESS_KEY: z.string(),
	S3_SECRET_KEY: z.string(),

	CORS_COOKIE_DOMAIN: z.string(),
	CORS_ORIGIN: z.string(),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.string(),

	EMAIL_HOST: z.string(),
	EMAIL_PORT: z.coerce.number(),
	EMAIL_USER: z.string(),
	EMAIL_PASSWORD: z.string(),

	MAIN_ADMIN_EMAIL: z.string().email(),
	MAIN_ADMIN_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);
