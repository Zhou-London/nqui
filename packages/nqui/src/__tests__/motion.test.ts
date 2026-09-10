/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";

/**
 * Guards the motion budget. Every one-shot transition or animation ends within 300 ms:
 * the `--nq-duration*` tokens, the `--animate-*` presets in `styles/tailwind.css`, and
 * the Tailwind `duration-*` classes in components. Looping indicators (shimmer, marquee,
 * indeterminate progress, blink) have no end and are exempt.
 */
const MAX_MS = 300;

const styles = Object.entries(
	import.meta.glob<string>("../../styles/*.css", { query: "?raw", import: "default", eager: true }),
);
const sources = Object.entries(
	import.meta.glob<string>("../**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }),
);

function toMs(value: string, unit: string): number {
	return unit === "s" ? Number(value) * 1000 : Number(value);
}

function lineOf(text: string, index: number): number {
	return text.slice(0, index).split("\n").length;
}

describe("motion budget", () => {
	it("keeps duration tokens and one-shot animation presets within 300 ms", () => {
		const found: string[] = [];
		for (const [file, text] of styles) {
			for (const line of text.split("\n")) {
				const declaration = /^\s*(--nq-duration[\w-]*|--animate-[\w-]+):(.*)$/.exec(line);
				if (!declaration || /infinite/.test(declaration[2] as string)) continue;
				for (const m of (declaration[2] as string).matchAll(/(\d+(?:\.\d+)?)(ms|s)\b/g)) {
					if (toMs(m[1] as string, m[2] as string) > MAX_MS) found.push(`${file}: ${line.trim()}`);
				}
			}
		}
		expect(found).toEqual([]);
	});

	it("keeps Tailwind duration classes within 300 ms", () => {
		const found: string[] = [];
		const durationClass = /(?<![\w-])duration-(\d+|\[(\d+(?:\.\d+)?)(ms|s)\])(?![\w-])/g;
		for (const [file, text] of sources) {
			if (file.includes("__tests__")) continue;
			for (const m of text.matchAll(durationClass)) {
				const ms = m[2] ? toMs(m[2], m[3] as string) : Number(m[1]);
				if (ms > MAX_MS) found.push(`${file.slice(3)}:${lineOf(text, m.index ?? 0)} ${m[0]}`);
			}
		}
		expect(found).toEqual([]);
	});
});
