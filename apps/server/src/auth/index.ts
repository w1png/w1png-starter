import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { Context } from "../context";

export class Auth {
	readonly auth;
	constructor({ context }: { context: Context }) {
		const env = context.env.values;
		this.auth = betterAuth({
			database: drizzleAdapter(context.db.connection, {
				provider: "pg",
				schema: context.db.tables,
			}),
			user: {
				additionalFields: {
					role: {
						type: "string",
						required: true,
						defaultValue: "USER",
						input: false,
					},
				},
			},
			trustedOrigins: [env.FRONTEND_URL],
			emailAndPassword: { enabled: true, disableSignUp: true },
			secret: env.BETTER_AUTH_SECRET,
			baseURL: env.BACKEND_URL,
			advanced:
				new URL(env.FRONTEND_URL).hostname === "localhost"
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
	}
}
