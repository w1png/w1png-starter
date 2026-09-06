import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@lunarweb/database/schema": fileURLToPath(
				new URL("../../packages/database/src/schema/index.ts", import.meta.url),
			),
			"@lunarweb/database": fileURLToPath(
				new URL("../../packages/database/src/index.ts", import.meta.url),
			),
			"@lunarweb/redis": fileURLToPath(
				new URL("../../packages/redis/src/index.ts", import.meta.url),
			),
			"@lunarweb/shared/schemas": fileURLToPath(
				new URL("../../packages/shared/src/schemas/index.ts", import.meta.url),
			),
			"@lunarweb/logger": fileURLToPath(
				new URL("../../packages/logger/src/index.ts", import.meta.url),
			),
			"@lunarweb/files": fileURLToPath(
				new URL("../../packages/files/src/index.ts", import.meta.url),
			),
		},
	},
	test: {
		environment: "node",
		globals: false,
		reporters: ["dot"],
		globalSetup: ["./tests/global-setup.ts"],
		include: ["tests/**/*.test.ts"],
		maxWorkers: 2,
		testTimeout: 15000,
		hookTimeout: 120000,
	},
});
