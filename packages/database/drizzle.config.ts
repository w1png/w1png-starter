import { env } from "@lunarweb/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/schema/index.ts",
	out: "./drizzle/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL || "",
	},
});
