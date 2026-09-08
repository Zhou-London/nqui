/**
 * Number formatting helpers shared by the finance and data components. All of them build
 * on `Intl.NumberFormat`, with the formatter instances cached per option set.
 */

const cache = new Map<string, Intl.NumberFormat>();

function formatter(
	locale: string | undefined,
	options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
	const key = `${locale ?? ""}|${JSON.stringify(options)}`;
	let f = cache.get(key);
	if (!f) {
		f = new Intl.NumberFormat(locale, options);
		cache.set(key, f);
	}
	return f;
}

export interface FormatOptions extends Intl.NumberFormatOptions {
	locale?: string;
}

export function formatNumber(value: number, options: FormatOptions = {}): string {
	const { locale, ...rest } = options;
	return formatter(locale, { maximumFractionDigits: 2, ...rest }).format(value);
}

/** 12345678 -> "12.3M" */
export function formatCompact(value: number, options: FormatOptions = {}): string {
	const { locale, ...rest } = options;
	return formatter(locale, {
		notation: "compact",
		maximumFractionDigits: 1,
		...rest,
	}).format(value);
}

export function formatCurrency(
	value: number,
	currency = "USD",
	options: FormatOptions & { compact?: boolean } = {},
): string {
	const { locale, compact, ...rest } = options;
	return formatter(locale, {
		style: "currency",
		currency,
		...(compact ? { notation: "compact", maximumFractionDigits: 1 } : {}),
		...rest,
	}).format(value);
}

/** 0.0532 -> "+5.32%" (input is a ratio, not a percentage). */
export function formatPercent(value: number, options: FormatOptions = {}): string {
	const { locale, ...rest } = options;
	return formatter(locale, {
		style: "percent",
		maximumFractionDigits: 2,
		signDisplay: "exceptZero",
		...rest,
	}).format(value);
}

/** Signed absolute change, e.g. "+1,242.77". */
export function formatDelta(value: number, options: FormatOptions = {}): string {
	const { locale, ...rest } = options;
	return formatter(locale, {
		maximumFractionDigits: 2,
		signDisplay: "exceptZero",
		...rest,
	}).format(value);
}

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;

export function formatBytes(bytes: number, fractionDigits = 1): string {
	if (!Number.isFinite(bytes) || bytes === 0) return "0 B";
	const exponent = Math.min(
		Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)),
		BYTE_UNITS.length - 1,
	);
	const value = bytes / 1024 ** exponent;
	return `${value.toFixed(exponent === 0 ? 0 : fractionDigits)} ${BYTE_UNITS[exponent]}`;
}

/** Milliseconds -> "1.2 ms", "340 ms", "2.4 s", "3m 12s". */
export function formatDuration(ms: number): string {
	if (!Number.isFinite(ms)) return "–";
	if (ms < 1) return `${(ms * 1000).toFixed(0)} µs`;
	if (ms < 10) return `${ms.toFixed(2)} ms`;
	if (ms < 1000) return `${ms.toFixed(0)} ms`;
	const s = ms / 1000;
	if (s < 60) return `${s.toFixed(s < 10 ? 2 : 1)} s`;
	const m = Math.floor(s / 60);
	const rest = Math.round(s % 60);
	if (m < 60) return `${m}m ${rest}s`;
	const h = Math.floor(m / 60);
	return `${h}h ${m % 60}m`;
}

/** Fixed-decimal string that keeps trailing zeros, for prices and quantities. */
export function formatFixed(value: number, decimals = 2, options: FormatOptions = {}): string {
	const { locale, ...rest } = options;
	return formatter(locale, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
		...rest,
	}).format(value);
}

/** Sign of a change as a semantic direction. */
export type Trend = "up" | "down" | "flat";

export function trendOf(value: number | null | undefined, epsilon = 0): Trend {
	if (value == null || Number.isNaN(value)) return "flat";
	if (value > epsilon) return "up";
	if (value < -epsilon) return "down";
	return "flat";
}
