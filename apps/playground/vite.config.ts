import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = (rel: string) =>
	fileURLToPath(new URL(`../../packages/nqui/src/${rel}`, import.meta.url));

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		// Point at the package sources so the playground hot-reloads component edits without a build.
		alias: [
			{ find: /^nqui\/charts$/, replacement: src("charts/index.ts") },
			{ find: /^nqui\/sql$/, replacement: src("sql/index.ts") },
			{ find: /^nqui$/, replacement: src("index.ts") },
		],
	},
});
