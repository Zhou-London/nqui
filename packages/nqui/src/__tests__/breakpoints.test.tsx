/// <reference types="vite/client" />
import { act, renderHook } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { breakpoints, useBreakpoint, useIsMobile, useTouchTargets } from "../hooks/use-media-query";

/**
 * Guards the five viewport tiers, 320 / 576 / 768 / 992 / 1200 px, in the stylesheet and in
 * the hooks, and checks the three tiers that must always work: 320, 768, and 1200.
 */
const css = Object.entries(
	import.meta.glob<string>("../../styles/*.css", { query: "?raw", import: "default", eager: true }),
).find(([path]) => path.endsWith("/tailwind.css"))?.[1] as string;

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
});

describe("breakpoints in the stylesheet", () => {
	it("declares exactly the five tiers and the page width", () => {
		const declared = [...css.matchAll(/--breakpoint-(\w+): ([\d.]+)rem;/g)].map(
			([, name, rem]) => [name, Number(rem) * 16] as const,
		);
		expect(declared).toEqual([
			["xs", 320],
			["sm", 576],
			["md", 768],
			["lg", 992],
			["xl", 1200],
		]);
		expect(css).toContain("--breakpoint-*: initial;");
		expect(css).toContain("--container-page: 75rem;");
	});

	it("enlarges touch targets by tier, below lg, not by pointer type", () => {
		expect(css).toMatch(/@utility touch-target \{\s*@variant max-lg \{/);
		expect(css).not.toContain("pointer: coarse");
		for (const [file, text] of sources) {
			expect(text, file).not.toContain("pointer-coarse:");
			// The tiers stop at xl; a `2xl:` class would never apply.
			expect(text, file).not.toMatch(/(?<![\w-])2xl:/);
		}
	});
});

/** matchMedia that evaluates `min-width` / `max-width` rem queries against `viewport`. */
let viewport = 1200;
const listeners = new Set<() => void>();

function setViewport(width: number) {
	viewport = width;
	act(() => {
		for (const cb of listeners) cb();
	});
}

beforeAll(() => {
	window.matchMedia = (query: string): MediaQueryList => {
		const min = /min-width: ([\d.]+)rem/.exec(query);
		const max = /max-width: ([\d.]+)rem/.exec(query);
		return {
			media: query,
			get matches() {
				if (min) return viewport >= Number(min[1]) * 16;
				if (max) return viewport <= Number(max[1]) * 16;
				return false;
			},
			addEventListener: (_: string, cb: () => void) => listeners.add(cb),
			removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
		} as unknown as MediaQueryList;
	};
});

describe("breakpoint hooks", () => {
	it("exports the tiers in pixels", () => {
		expect(breakpoints).toEqual({ xs: 320, sm: 576, md: 768, lg: 992, xl: 1200 });
	});

	it("reports the tier at 320, 768, and 1200 and at every edge", () => {
		const { result } = renderHook(() => useBreakpoint());
		const expected: [number, string][] = [
			[320, "xs"],
			[575, "xs"],
			[576, "sm"],
			[768, "md"],
			[991, "md"],
			[992, "lg"],
			[1200, "xl"],
			[1920, "xl"],
		];
		for (const [width, tier] of expected) {
			setViewport(width);
			expect(result.current, `${width}px`).toBe(tier);
		}
	});

	it("enlarges touch targets at 320 and 768 but not at 1200", () => {
		const touch = renderHook(() => useTouchTargets());
		const mobile = renderHook(() => useIsMobile());
		setViewport(320);
		expect(touch.result.current).toBe(true);
		expect(mobile.result.current).toBe(true);
		setViewport(768);
		expect(touch.result.current).toBe(true);
		expect(mobile.result.current).toBe(false);
		setViewport(1200);
		expect(touch.result.current).toBe(false);
		expect(mobile.result.current).toBe(false);
	});
});
