/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";

/**
 * Guards the color system: one primary scale, one gray scale, and four semantic colors are
 * the only literal colors; every other token derives from them; dark mode re-points the
 * roles; the error color is named `error` everywhere.
 */
const styles = import.meta.glob<string>("../../styles/*.css", {
	query: "?raw",
	import: "default",
	eager: true,
});
const tokens = styles["../../styles/tokens.css"] as string;
const theme = styles["../../styles/tailwind.css"] as string;

const sources = Object.entries({
	...import.meta.glob<string>("../**/*.{ts,tsx}", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
	...import.meta.glob<string>("../../../../apps/playground/src/**/*.{ts,tsx}", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
	...import.meta.glob<string>("../../../../docs/*.md", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const paletteInputs = [
	"primary",
	...steps.map((s) => `primary-${s}`),
	"gray",
	...steps.map((s) => `gray-${s}`),
	"success",
	"error",
	"warning",
	"info",
];

function lightBlock(css: string): string {
	return css.slice(0, css.indexOf("\n.dark,"));
}
function darkBlock(css: string): string {
	const start = css.indexOf("\n.dark,");
	return css.slice(start, css.indexOf("\n}", start));
}

describe("color palette", () => {
	it("declares exactly one primary scale, one gray scale, and four semantic colors", () => {
		const declared = [...lightBlock(tokens).matchAll(/^\t--nq-color-([\w-]+):/gm)].map((m) => m[1]);
		expect(declared).toEqual(paletteInputs);
	});

	it("keeps every literal chromatic color on a palette input", () => {
		const offenders: string[] = [];
		for (const [i, line] of tokens.split("\n").entries()) {
			if (/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(line))
				offenders.push(`${i + 1}: ${line.trim()}`);
			for (const m of line.matchAll(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)/g)) {
				const chromatic = Number(m[2]) > 0;
				const isInput = /^\t--nq-color-(primary|gray|success|error|warning|info):/.test(line);
				if (chromatic && !isInput) offenders.push(`${i + 1}: ${line.trim()}`);
			}
		}
		expect(offenders).toEqual([]);
	});

	it("derives the scale steps from the main color", () => {
		for (const step of steps.filter((s) => s !== 500)) {
			expect(tokens).toMatch(
				new RegExp(`--nq-color-primary-${step}: oklch\\(from var\\(--nq-color-primary\\)`),
			);
			expect(tokens).toMatch(
				new RegExp(`--nq-color-gray-${step}: oklch\\(from var\\(--nq-color-gray\\)`),
			);
		}
		expect(tokens).toContain("--nq-color-primary-500: var(--nq-color-primary);");
		expect(tokens).toContain("--nq-color-gray-500: var(--nq-color-gray);");
	});

	it("maps the gray scale to the text, disabled, and canvas roles in both modes", () => {
		const light = lightBlock(tokens);
		const dark = darkBlock(tokens);
		const roles = {
			"--nq-fg": ["gray-900", "gray-100"],
			"--nq-muted": ["gray-600", "gray-400"],
			"--nq-subtle": ["gray-500", "gray-500"],
			"--nq-disabled": ["gray-400", "gray-600"],
			"--nq-bg": ["gray-50", "gray-900"],
		};
		for (const [role, [lightStep, darkStep]] of Object.entries(roles)) {
			expect(light).toContain(`${role}: var(--nq-color-${lightStep});`);
			expect(dark).toContain(`${role}: var(--nq-color-${darkStep});`);
		}
	});

	it("re-points every color role in dark mode", () => {
		const dark = darkBlock(tokens);
		for (const role of [
			"surface",
			"surface-2",
			"surface-3",
			"border",
			"border-strong",
			"focus",
			"accent",
			"neutral",
			"primary",
			"primary-soft",
			"primary-text",
			"success",
			"success-soft",
			"success-text",
			"error",
			"error-soft",
			"error-text",
			"warning",
			"warning-soft",
			"warning-text",
			"info",
			"info-soft",
			"info-text",
		]) {
			expect(dark, role).toMatch(new RegExp(`\n\t--nq-${role}: `));
		}
	});

	it("exposes only the primary scale to utilities and names the roles success, error, warning, info", () => {
		expect(theme).not.toMatch(/--color-(success|error|warning|info|gray)-\d/);
		expect(theme).not.toContain("-950");
		for (const name of ["success", "error", "warning", "info", "disabled"]) {
			expect(theme).toContain(`--color-${name}: var(--nq-${name});`);
		}
	});

	it("uses no other name than error for the error color", () => {
		expect(tokens).not.toContain("danger");
		expect(theme).not.toContain("danger");
		for (const [file, text] of sources) expect(text, file).not.toContain("danger");
	});
});
