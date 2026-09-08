import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	platform: "browser",
	dts: true,
	clean: true,
	// Every module in this package renders on the client, so mark the bundle for RSC frameworks.
	banner: { js: '"use client";' },
});
