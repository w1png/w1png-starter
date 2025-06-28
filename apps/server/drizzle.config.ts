import { env } from "@/lib/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/lib/db/schema/index.ts",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL || "",
	},
});
