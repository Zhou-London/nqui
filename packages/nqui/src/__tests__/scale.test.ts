/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";

/**
 * Guards the layout scale. Spacing (padding, margin, gap) may only use 4 / 8 / 16 / 24 /
 * 32 / 48 / 64 px, which are Tailwind steps 1, 2, 4, 6, 8, 12 and 16. Font sizes may only
 * use the seven steps declared in `styles/tailwind.css`.
 */
const SPACING_STEPS = new Set(["0", "1", "2", "4", "6", "8", "12", "16", "px", "auto", "full"]);
const TEXT_STEPS = new Set(["xs", "sm", "base", "xl", "2xl", "3xl", "5xl"]);

const spacingClass =
	/(?<![\w[-])-?(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-(\[[^\]]+\]|[\d.]+|px|auto|full)(?![\w.-])/g;
const textClass = /(?<![\w-])text-(\d?xs|sm|base|lg|\d?xl|\[[^\]]+\])(?![\w-])/g;

const sources = Object.entries(
	import.meta.glob<string>("../**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }),
).filter(([path]) => path.startsWith("../"));

function offenders(re: RegExp, allowed: Set<string>, pick: (m: RegExpMatchArray) => string) {
	const found: string[] = [];
	for (const [file, text] of sources) {
		for (const m of text.matchAll(re)) {
			const step = pick(m);
			// Pass-throughs and viewport placement are not scale values.
			if (allowed.has(step) || step === "[inherit]" || step.startsWith("[env(")) continue;
			if (/^\[[\d.]+d?v[hw]\]$/.test(step)) continue;
			const line = text.slice(0, m.index).split("\n").length;
			found.push(`${file.slice(3)}:${line} ${m[0]}`);
		}
	}
	return found;
}

describe("layout scale", () => {
	it("keeps padding, margin, and gap on the 4/8/16/24/32/48/64 grid", () => {
		expect(offenders(spacingClass, SPACING_STEPS, (m) => m[2] as string)).toEqual([]);
	});
	it("keeps font sizes on the seven-step type scale", () => {
		expect(offenders(textClass, TEXT_STEPS, (m) => m[1] as string)).toEqual([]);
	});
});
