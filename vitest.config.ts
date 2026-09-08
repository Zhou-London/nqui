import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (pkg: string) =>
	fileURLToPath(new URL(`./packages/${pkg}/src/index.ts`, import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"@nqui/react": src("react"),
			"@nqui/charts": src("charts"),
			"@nqui/sql": src("sql"),
		},
	},
	test: {
		globals: true,
		environment: "happy-dom",
		include: ["packages/**/*.test.{ts,tsx}"],
	},
});
