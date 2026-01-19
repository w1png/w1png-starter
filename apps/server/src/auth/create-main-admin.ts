import { db } from "@lunarweb/database";
import { user } from "@lunarweb/database/schema";
import { env } from "@lunarweb/env";
import { logger } from "@lunarweb/logger";
import { eq } from "drizzle-orm";
import { auth } from "./auth";

let created = false;

export async function createMainAdminIfNotExists() {
	const existingAdmin = await db.query.user.findFirst({
		where: eq(user.email, env.MAIN_ADMIN_EMAIL),
	});

	if (existingAdmin) {
		logger.info("Main admin already exists, skipping creation");
		created = true;
		return;
	}

	await auth.api.signUpEmail({
		body: {
			name: "Admin",
			email: env.MAIN_ADMIN_EMAIL,
			password: env.MAIN_ADMIN_PASSWORD,
		},
	});

	await db
		.update(user)
		.set({
			role: "ADMIN",
		})
		.where(eq(user.email, env.MAIN_ADMIN_EMAIL));

	logger.info("Admin created");
	created = true;
}

export function allowSignUp() {
	return !created;
}
