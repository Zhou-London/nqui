import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = (pkg: string) =>
	fileURLToPath(new URL(`../../packages/${pkg}/src/index.ts`, import.meta.url));

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		// Point at package sources so the playground hot-reloads component edits without a build.
		alias: {
			"@nqui/react": src("react"),
			"@nqui/charts": src("charts"),
			"@nqui/sql": src("sql"),
		},
	},
});
