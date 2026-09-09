import { type RefObject, useEffect, useState } from "react";

/** Ordered series palette, as CSS variable references usable in SVG attributes. */
export const chartColors = [
	"var(--nq-chart-1)",
	"var(--nq-chart-2)",
	"var(--nq-chart-3)",
	"var(--nq-chart-4)",
	"var(--nq-chart-5)",
	"var(--nq-chart-6)",
] as const;

export function seriesColor(index: number): string {
	return chartColors[index % chartColors.length] as string;
}

export interface ResolvedChartTheme {
	surface: string;
	text: string;
	muted: string;
	border: string;
	grid: string;
	primary: string;
	up: string;
	down: string;
	fontFamily: string;
	isDark: boolean;
}

const rgbaCache = new Map<string, string>();
let scratch: CanvasRenderingContext2D | null | undefined;

/**
 * Convert any CSS color the browser understands (oklch, color-mix, hex…) to an `rgba()`
 * string by painting it on a 1×1 canvas. Canvas renderers such as lightweight-charts only
 * parse hex, rgb, and hsl.
 */
export function toRgba(color: string, alpha?: number): string {
	const key = `${color}|${alpha ?? ""}`;
	const cached = rgbaCache.get(key);
	if (cached) return cached;
	if (scratch === undefined) {
		scratch =
			typeof document === "undefined"
				? null
				: document.createElement("canvas").getContext("2d", { willReadFrequently: true });
	}
	let out = color;
	if (scratch) {
		scratch.clearRect(0, 0, 1, 1);
		scratch.fillStyle = "#000";
		scratch.fillStyle = color;
		scratch.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = scratch.getImageData(0, 0, 1, 1).data as unknown as [
			number,
			number,
			number,
			number,
		];
		out = `rgba(${r}, ${g}, ${b}, ${alpha ?? +(a / 255).toFixed(3)})`;
	}
	rgbaCache.set(key, out);
	return out;
}

function read(el: Element, name: string): string {
	return toRgba(getComputedStyle(el).getPropertyValue(name).trim());
}

/** Resolve NQUI tokens to concrete color strings from an element's computed style. */
export function resolveChartTheme(el: Element): ResolvedChartTheme {
	const root = document.documentElement;
	return {
		surface: read(el, "--nq-surface"),
		text: read(el, "--nq-fg"),
		muted: read(el, "--nq-muted"),
		border: read(el, "--nq-border"),
		grid: read(el, "--nq-chart-grid"),
		primary: read(el, "--nq-primary"),
		up: read(el, "--nq-up"),
		down: read(el, "--nq-down"),
		fontFamily: getComputedStyle(el).getPropertyValue("--nq-font-sans").trim() || "sans-serif",
		isDark: root.classList.contains("dark") || root.dataset.theme === "dark",
	};
}

function sameTheme(a: ResolvedChartTheme | null, b: ResolvedChartTheme): boolean {
	if (!a) return false;
	for (const k of Object.keys(b) as (keyof ResolvedChartTheme)[]) if (a[k] !== b[k]) return false;
	return true;
}

/**
 * Canvas renderers cannot read CSS variables, so this resolves the tokens once and again
 * whenever the color scheme changes on `<html>` or the nearest `[data-market]` ancestor (the
 * wrapper `NquiProvider` renders) flips market. Unrelated attribute changes are ignored: the
 * theme object only changes identity when a resolved value differs.
 */
export function useChartTheme(ref: RefObject<Element | null>): ResolvedChartTheme | null {
	const [theme, setTheme] = useState<ResolvedChartTheme | null>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const update = () => {
			const next = resolveChartTheme(el);
			setTheme((prev) => (sameTheme(prev, next) ? prev : next));
		};
		update();
		const observer = new MutationObserver(update);
		const options = { attributes: true, attributeFilter: ["class", "data-theme", "data-market"] };
		observer.observe(document.documentElement, options);
		const market = el.closest("[data-market]");
		if (market && market !== document.documentElement) observer.observe(market, options);
		return () => observer.disconnect();
	}, [ref]);
	return theme;
}
