import { db } from "@lunarweb/database";
import * as schema from "@lunarweb/database/schema";
import type { UserRole } from "@lunarweb/shared/schemas";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { allowSignUp } from "./create-main-admin";
import { env } from "@lunarweb/env";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				defaultValue: "USER" as UserRole,
				input: false,
			},
		},
	},
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
		disableSignUp: !allowSignUp(),
	},
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	advanced: env.CORS_ORIGIN.includes("localhost")
		? undefined
		: {
				defaultCookieAttributes: {
					secure: true,
					httpOnly: true,
					sameSite: "lax",
				},
				crossSubDomainCookies: {
					enabled: true,
					domain: env.CORS_COOKIE_DOMAIN,
				},
			},
});
