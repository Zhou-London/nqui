import {
	CandlestickSeries,
	ColorType,
	CrosshairMode,
	createChart,
	HistogramSeries,
	type IChartApi,
	type ISeriesApi,
	LineSeries,
	type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { cn } from "../utils/cn";
import { toRgba, useChartTheme } from "./theme";

export interface Candle {
	/** Unix seconds or an ISO date string (`YYYY-MM-DD`). */
	time: number | string;
	open: number;
	high: number;
	low: number;
	close: number;
	volume?: number;
}

export interface CandlestickChartProps {
	data: Candle[];
	height?: number;
	/** Draw volume bars along the bottom. */
	showVolume?: boolean;
	/** Simple moving average window lengths, e.g. [20, 50]. */
	movingAverages?: number[];
	priceFormat?: { precision?: number; minMove?: number };
	className?: string;
	/** Fires with the hovered candle, or null when the cursor leaves. */
	onCrosshairMove?: (candle: Candle | null) => void;
}

/** Normalize a candle time to what lightweight-charts accepts: unix seconds or `YYYY-MM-DD`. */
export function toTime(t: number | string): UTCTimestamp | string {
	return typeof t === "number" ? ((t > 1e12 ? Math.floor(t / 1000) : t) as UTCTimestamp) : t;
}

type Point = { time: UTCTimestamp | string; value: number };

/** Simple moving average of `close` over `window` bars; the first `window - 1` bars have none. */
export function sma(data: Candle[], window: number): Point[] {
	const out: Point[] = [];
	let sum = 0;
	for (let i = 0; i < data.length; i++) {
		const c = data[i] as Candle;
		sum += c.close;
		if (i >= window) sum -= (data[i - window] as Candle).close;
		if (i >= window - 1) out.push({ time: toTime(c.time), value: sum / window });
	}
	return out;
}

/** The moving average at index `i` only, for incremental updates. */
function smaAt(data: Candle[], window: number, i: number): Point | null {
	if (i < window - 1) return null;
	let sum = 0;
	for (let j = i - window + 1; j <= i; j++) sum += (data[j] as Candle).close;
	return { time: toTime((data[i] as Candle).time), value: sum / window };
}

/**
 * True when `next` is `prev` with at most one bar appended and/or the last bar changed, which
 * is the live-feed shape that `series.update()` handles without resetting the view.
 */
function isIncremental(prev: Candle[], next: Candle[]): boolean {
	if (prev.length === 0 || next.length < prev.length || next.length > prev.length + 1) return false;
	const last = prev.length - 1;
	if ((prev[last] as Candle).time !== (next[last] as Candle).time) return false;
	for (let i = 0; i < last; i++) if (prev[i] !== next[i]) return false;
	return true;
}

const maColors = ["var(--nq-chart-4)", "var(--nq-chart-5)", "var(--nq-chart-3)"];

/**
 * OHLC candlestick chart on TradingView's lightweight-charts. Colors are resolved from
 * NQUI tokens at mount and refreshed on theme changes. The view is fitted to the data on
 * first paint and whenever the data set is replaced; live appends keep the user's zoom.
 */
export function CandlestickChart({
	data,
	height = 360,
	showVolume = true,
	movingAverages = [],
	priceFormat,
	className,
	onCrosshairMove,
}: CandlestickChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<IChartApi | null>(null);
	const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
	const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
	const maRefs = useRef<ISeriesApi<"Line">[]>([]);
	// What the current chart instance has been given, so the data effect can tell an append from a reset.
	const pushed = useRef<{ chart: IChartApi | null; data: Candle[] }>({ chart: null, data: [] });
	const theme = useChartTheme(containerRef);
	const maKey = movingAverages.join(",");
	const windows = useMemo(() => maKey.split(",").filter(Boolean).map(Number), [maKey]);
	const { precision = 2, minMove = 0.01 } = priceFormat ?? {};
	const byTime = useMemo(() => new Map(data.map((c) => [String(toTime(c.time)), c])), [data]);
	// Latest lookup and callback, readable from the chart's crosshair handler without re-creating the chart.
	const latest = useRef({ byTime, onCrosshairMove });
	useLayoutEffect(() => {
		latest.current = { byTime, onCrosshairMove };
	});

	// Create the chart once the theme is known; rebuild when the theme flips.
	useEffect(() => {
		const el = containerRef.current;
		if (!el || !theme) return;
		const chart = createChart(el, {
			width: el.clientWidth,
			height: el.clientHeight || height,
			layout: {
				background: { type: ColorType.Solid, color: "transparent" },
				textColor: theme.muted,
				fontFamily: theme.fontFamily,
				fontSize: 12,
				attributionLogo: false,
			},
			grid: { vertLines: { color: theme.grid }, horzLines: { color: theme.grid } },
			rightPriceScale: {
				borderColor: theme.border,
				scaleMargins: showVolume ? { top: 0.1, bottom: 0.25 } : { top: 0.1, bottom: 0.1 },
			},
			timeScale: { borderColor: theme.border, timeVisible: true, secondsVisible: false },
			crosshair: {
				mode: CrosshairMode.Normal,
				vertLine: { color: theme.muted, labelBackgroundColor: theme.text },
				horzLine: { color: theme.muted, labelBackgroundColor: theme.text },
			},
			handleScroll: true,
			handleScale: true,
		});
		const candles = chart.addSeries(CandlestickSeries, {
			upColor: theme.up,
			downColor: theme.down,
			wickUpColor: theme.up,
			wickDownColor: theme.down,
			borderVisible: false,
			priceFormat: { type: "price", precision, minMove },
		});
		let volume: ISeriesApi<"Histogram"> | null = null;
		if (showVolume) {
			volume = chart.addSeries(HistogramSeries, {
				priceFormat: { type: "volume" },
				priceScaleId: "volume",
			});
			chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
		}
		const mas = windows.map((_, i) =>
			chart.addSeries(LineSeries, {
				color: resolveVar(el, maColors[i % maColors.length] as string),
				lineWidth: 1,
				priceLineVisible: false,
				lastValueVisible: false,
				crosshairMarkerVisible: false,
			}),
		);
		chartRef.current = chart;
		candleRef.current = candles;
		volumeRef.current = volume;
		maRefs.current = mas;
		const handler = (param: { time?: unknown }) => {
			const { byTime: rows, onCrosshairMove: cb } = latest.current;
			if (!cb) return;
			cb(param.time === undefined ? null : (rows.get(String(param.time)) ?? null));
		};
		chart.subscribeCrosshairMove(handler);

		// Track the container's box. The chart may be created before layout settles (a flex
		// column still measuring, fonts loading), so the first non-zero size observed re-fits the
		// view; later resizes keep whatever range the user has chosen.
		let fitted = false;
		const observer =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver((entries) => {
						const box = entries[0]?.contentRect;
						if (!box) return;
						const width = Math.floor(box.width);
						const h = Math.floor(box.height) || height;
						if (width === 0) return;
						chart.applyOptions({ width, height: h });
						if (!fitted) {
							fitted = true;
							chart.timeScale().fitContent();
						}
					});
		observer?.observe(el);
		return () => {
			observer?.disconnect();
			chart.unsubscribeCrosshairMove(handler);
			chart.remove();
			chartRef.current = null;
			candleRef.current = null;
			volumeRef.current = null;
			maRefs.current = [];
		};
	}, [theme, showVolume, windows, precision, minMove, height]);

	// Push data whenever it or the series set changes. Live appends go through `update()` so
	// the user's zoom and scroll position survive; anything else replaces the series data.
	useEffect(() => {
		const chart = chartRef.current;
		const candles = candleRef.current;
		if (!chart || !candles || !theme) return;
		const prev = pushed.current;
		pushed.current = { chart, data };
		const volumeColor = (c: Candle) =>
			c.close >= c.open ? withAlpha(theme.up, 0.35) : withAlpha(theme.down, 0.35);
		const bar = (c: Candle) => ({
			time: toTime(c.time),
			open: c.open,
			high: c.high,
			low: c.low,
			close: c.close,
		});
		const vol = (c: Candle) => ({
			time: toTime(c.time),
			value: c.volume ?? 0,
			color: volumeColor(c),
		});

		if (prev.chart === chart && isIncremental(prev.data, data)) {
			for (let i = prev.data.length - 1; i < data.length; i++) {
				const c = data[i] as Candle;
				candles.update(bar(c));
				volumeRef.current?.update(vol(c));
				maRefs.current.forEach((series, m) => {
					const point = windows[m] ? smaAt(data, windows[m] as number, i) : null;
					if (point) series.update(point);
				});
			}
			return;
		}

		candles.setData(data.map(bar));
		volumeRef.current?.setData(data.map(vol));
		maRefs.current.forEach((series, i) => {
			const window = windows[i];
			if (window) series.setData(sma(data, window));
		});
		// Fit on the first data, after a reset, or when the chart was rebuilt (e.g. theme flip).
		const fresh = prev.chart !== chart || prev.data.length === 0 || data.length < prev.data.length;
		if (fresh && data.length > 0) chart.timeScale().fitContent();
	}, [data, theme, windows]);

	return <div ref={containerRef} className={cn("w-full", className)} style={{ height }} />;
}

function resolveVar(el: Element, value: string): string {
	const m = value.match(/^var\((--[^)]+)\)$/);
	return toRgba(
		m
			? getComputedStyle(el)
					.getPropertyValue(m[1] as string)
					.trim() || value
			: value,
	);
}

/** Apply transparency to an already-resolved color. */
function withAlpha(color: string, alpha: number): string {
	return toRgba(color, alpha);
}
