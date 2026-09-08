import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (rel: string) => fileURLToPath(new URL(`./packages/nqui/src/${rel}`, import.meta.url));

export default defineConfig({
	resolve: {
		alias: [
			{ find: /^nqui\/charts$/, replacement: src("charts/index.ts") },
			{ find: /^nqui\/sql$/, replacement: src("sql/index.ts") },
			{ find: /^nqui$/, replacement: src("index.ts") },
		],
	},
	test: {
		globals: true,
		environment: "happy-dom",
		include: ["packages/**/*.test.{ts,tsx}"],
	},
});
