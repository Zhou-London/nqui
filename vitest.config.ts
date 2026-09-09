import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (rel: string) => fileURLToPath(new URL(`./packages/nqui/src/${rel}`, import.meta.url));

export default defineConfig({
	resolve: {
		alias: [
			{ find: /^@nowquant\/nqui\/charts$/, replacement: src("charts/index.ts") },
			{ find: /^@nowquant\/nqui\/sql$/, replacement: src("sql/index.ts") },
			{ find: /^@nowquant\/nqui$/, replacement: src("index.ts") },
		],
	},
	test: {
		// Testing Library registers its automatic cleanup on the global `afterEach`.
		globals: true,
		environment: "happy-dom",
		include: ["packages/**/*.test.{ts,tsx}"],
	},
});
