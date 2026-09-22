/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";

/**
 * The build keeps one output file per module, so each module's own directive decides whether
 * React Server Components treat it as client code. A module that uses React state, context,
 * effects, event handlers, React Aria, or a browser-only library must start with
 * "use client"; utilities must not, so a server component can still call them.
 */
const sources = Object.entries(
	import.meta.glob<string>("../**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }),
).filter(([path]) => path.startsWith("../") && !path.startsWith("../__tests__/"));

const clientOnly =
	/from "react-aria-components"|\buse[A-Z][A-Za-z]*\(|createContext|\bon[A-Z][A-Za-z]*=\{|from "(recharts|lightweight-charts|@codemirror\/[a-z-]+|@tiptap\/[a-z-]+)"|\bwindow\.|\bdocument\./;
const directive = /^"use client";\n/;

describe('"use client"', () => {
	it("marks every module that needs the client", () => {
		const missing = sources
			.filter(([, text]) => clientOnly.test(text) && !directive.test(text))
			.map(([file]) => file.slice(3));
		expect(missing).toEqual([]);
	});
	it("leaves the public utilities callable from server components", () => {
		const serverSafe = [
			"utils/cn.ts",
			"utils/tv.ts",
			"utils/format.ts",
			"utils/extent.ts",
			"utils/focus-ring.ts",
			"i18n/messages.ts",
			"markdown/markdown.tsx",
		];
		const marked = sources
			.filter(([file, text]) => serverSafe.includes(file.slice(3)) && directive.test(text))
			.map(([file]) => file.slice(3));
		expect(marked).toEqual([]);
		expect(sources.filter(([file]) => serverSafe.includes(file.slice(3)))).toHaveLength(
			serverSafe.length,
		);
	});
});
