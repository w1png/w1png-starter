import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		tailwindcss(),
		tanstackStart({}),
		nitroV2Plugin({ preset: "bun" }),
		react(),
	],
	server: {
		allowedHosts: ["demo.w1png.ru"],
	},
});
