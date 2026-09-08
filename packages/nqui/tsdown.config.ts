import { defineConfig } from "tsdown";

export default defineConfig({
	// One package, three entry points: shared code is split into common chunks so a project that
	// never imports `nqui/charts` or `nqui/sql` does not ship Recharts or CodeMirror.
	entry: {
		index: "src/index.ts",
		charts: "src/charts/index.ts",
		sql: "src/sql/index.ts",
	},
	format: ["esm"],
	platform: "browser",
	dts: true,
	clean: true,
	// Every module renders on the client, so mark the bundles for RSC frameworks.
	banner: { js: '"use client";' },
});
