import { cn } from "@nqui/react";
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
import { useEffect, useMemo, useRef } from "react";
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

function toTime(t: number | string): UTCTimestamp | string {
	return typeof t === "number" ? ((t > 1e12 ? Math.floor(t / 1000) : t) as UTCTimestamp) : t;
}

function sma(data: Candle[], window: number): { time: UTCTimestamp | string; value: number }[] {
	const out: { time: UTCTimestamp | string; value: number }[] = [];
	let sum = 0;
	for (let i = 0; i < data.length; i++) {
		const c = data[i] as Candle;
		sum += c.close;
		if (i >= window) sum -= (data[i - window] as Candle).close;
		if (i >= window - 1) out.push({ time: toTime(c.time), value: sum / window });
	}
	return out;
}

const maColors = ["var(--nq-chart-4)", "var(--nq-chart-5)", "var(--nq-chart-3)"];

/**
 * OHLC candlestick chart on TradingView's lightweight-charts. Colors are resolved from
 * NQUI tokens at mount and refreshed on theme changes.
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
	const theme = useChartTheme(containerRef);
	const maKey = movingAverages.join(",");
	const windows = useMemo(() => maKey.split(",").filter(Boolean).map(Number), [maKey]);
	const { precision = 2, minMove = 0.01 } = priceFormat ?? {};
	// Latest data and callback, readable from the chart's crosshair handler without re-creating the chart.
	const latest = useRef({ data, onCrosshairMove });
	latest.current = { data, onCrosshairMove };

	// Create the chart once the theme is known; rebuild when the theme flips.
	useEffect(() => {
		const el = containerRef.current;
		if (!el || !theme) return;
		const chart = createChart(el, {
			autoSize: true,
			layout: {
				background: { type: ColorType.Solid, color: "transparent" },
				textColor: theme.muted,
				fontFamily: theme.fontFamily,
				fontSize: 11,
				attributionLogo: false,
			},
			grid: { vertLines: { color: theme.grid }, horzLines: { color: theme.grid } },
			rightPriceScale: { borderColor: theme.border },
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
			const { data: rows, onCrosshairMove: cb } = latest.current;
			if (!cb) return;
			if (param.time === undefined) cb(null);
			else cb(rows.find((c) => String(toTime(c.time)) === String(param.time)) ?? null);
		};
		chart.subscribeCrosshairMove(handler);
		return () => {
			chart.unsubscribeCrosshairMove(handler);
			chart.remove();
			chartRef.current = null;
			candleRef.current = null;
			volumeRef.current = null;
			maRefs.current = [];
		};
	}, [theme, showVolume, windows, precision, minMove]);

	// Push data whenever it or the series set changes.
	useEffect(() => {
		const candles = candleRef.current;
		if (!candles || !theme) return;
		candles.setData(
			data.map((c) => ({
				time: toTime(c.time),
				open: c.open,
				high: c.high,
				low: c.low,
				close: c.close,
			})),
		);
		volumeRef.current?.setData(
			data.map((c) => ({
				time: toTime(c.time),
				value: c.volume ?? 0,
				color: c.close >= c.open ? withAlpha(theme.up, 0.35) : withAlpha(theme.down, 0.35),
			})),
		);
		maRefs.current.forEach((series, i) => {
			const window = windows[i];
			if (window) series.setData(sma(data, window));
		});
		chartRef.current?.timeScale().fitContent();
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
