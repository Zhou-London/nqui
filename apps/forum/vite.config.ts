import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = (rel: string) =>
	fileURLToPath(new URL(`../../packages/nqui/src/${rel}`, import.meta.url));

export default defineConfig({
	// Relative asset URLs so the built app works from any static host path.
	base: "./",
	plugins: [react(), tailwindcss()],
	resolve: {
		// Point at the package sources so the app hot-reloads component edits without a build.
		alias: [
			{ find: /^@nowquant\/nqui\/charts$/, replacement: src("charts/index.ts") },
			{ find: /^@nowquant\/nqui\/sql$/, replacement: src("sql/index.ts") },
			{ find: /^@nowquant\/nqui\/markdown$/, replacement: src("markdown/index.ts") },
			{ find: /^@nowquant\/nqui\/editor$/, replacement: src("editor/index.ts") },
			{ find: /^@nowquant\/nqui$/, replacement: src("index.ts") },
		],
	},
});
