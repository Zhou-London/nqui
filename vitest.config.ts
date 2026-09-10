import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (rel: string) => fileURLToPath(new URL(`./packages/nqui/src/${rel}`, import.meta.url));

export default defineConfig({
	resolve: {
		alias: [
			{ find: /^@nowquant\/nqui\/charts$/, replacement: src("charts/index.ts") },
			{ find: /^@nowquant\/nqui\/sql$/, replacement: src("sql/index.ts") },
			{ find: /^@nowquant\/nqui\/markdown$/, replacement: src("markdown/index.ts") },
			{ find: /^@nowquant\/nqui\/editor$/, replacement: src("editor/index.ts") },
			{ find: /^@nowquant\/nqui$/, replacement: src("index.ts") },
		],
	},
	test: {
		// Testing Library registers its automatic cleanup on the global `afterEach`.
		globals: true,
		environment: "happy-dom",
		// Off, Vitest replaces every CSS import with an empty string, `?raw` included; the
		// style tests read `styles/*.css` as text.
		css: true,
		include: ["packages/**/*.test.{ts,tsx}"],
	},
});
