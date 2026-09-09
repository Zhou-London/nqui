import { describe, expect, it } from "vitest";
import {
	formatBytes,
	formatCompact,
	formatCurrency,
	formatDelta,
	formatDuration,
	formatPercent,
	trendOf,
} from "../utils/format";

describe("format helpers", () => {
	it("formats currency with two decimals", () => {
		expect(formatCurrency(24801.32, "USD", { locale: "en-US" })).toBe("$24,801.32");
	});
	it("formats compact numbers", () => {
		expect(formatCompact(1_200_000_000, { locale: "en-US" })).toBe("1.2B");
	});
	it("formats signed percentages from ratios", () => {
		expect(formatPercent(0.0532, { locale: "en-US" })).toBe("+5.32%");
		expect(formatPercent(-0.021, { locale: "en-US" })).toBe("-2.1%");
		expect(formatPercent(0, { locale: "en-US" })).toBe("0%");
	});
	it("formats deltas with an explicit sign", () => {
		expect(formatDelta(1242.77, { locale: "en-US" })).toBe("+1,242.77");
	});
	it("formats bytes and durations", () => {
		expect(formatBytes(812.4 * 1024 ** 3)).toBe("812.4 GB");
		expect(formatBytes(0)).toBe("0 B");
		expect(formatDuration(0.4)).toBe("400 µs");
		expect(formatDuration(142)).toBe("142 ms");
		expect(formatDuration(2400)).toBe("2.40 s");
		expect(formatDuration(192_000)).toBe("3m 12s");
	});
	it("rounds whole seconds before splitting minutes", () => {
		expect(formatDuration(119_600)).toBe("2m 0s");
		expect(formatDuration(3_599_600)).toBe("1h 0m");
	});
	it("keeps the sign of negative durations", () => {
		expect(formatDuration(-142)).toBe("-142 ms");
		expect(formatDuration(-2400)).toBe("-2.40 s");
		expect(formatDuration(-0.4)).toBe("-400 µs");
	});
	it("uses the placeholder for non-finite bytes and durations", () => {
		expect(formatBytes(Number.POSITIVE_INFINITY)).toBe("–");
		expect(formatBytes(Number.NaN)).toBe("–");
		expect(formatDuration(Number.NaN)).toBe("–");
	});
	it("classifies trends with an epsilon", () => {
		expect(trendOf(0.5)).toBe("up");
		expect(trendOf(-0.5)).toBe("down");
		expect(trendOf(0.0001, 0.001)).toBe("flat");
		expect(trendOf(null)).toBe("flat");
	});
});
