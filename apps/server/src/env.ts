import { z } from "zod/v4";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().int().min(1).max(65535).default(3000),
	DATABASE_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(10),
	DATABASE_URL: z.url(),
	REDIS_URL: z.url(),

	S3_REGION: z.string(),
	S3_ENDPOINT: z.string(),
	S3_ACCESS_KEY: z.string(),
	S3_SECRET_KEY: z.string(),

	CORS_COOKIE_DOMAIN: z.string(),
	BETTER_AUTH_SECRET: z.string().min(32),
	FRONTEND_URL: z.url(),
	BACKEND_URL: z.url(),

	MAIN_ADMIN_EMAIL: z.email(),
	MAIN_ADMIN_PASSWORD: z.string().min(8),
});

export class Env {
	readonly values: z.infer<typeof envSchema>;

	constructor(values: Record<string, string | undefined> = process.env) {
		this.values = envSchema.parse(values);
	}
}
