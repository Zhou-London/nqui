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
	it("classifies trends with an epsilon", () => {
		expect(trendOf(0.5)).toBe("up");
		expect(trendOf(-0.5)).toBe("down");
		expect(trendOf(0.0001, 0.001)).toBe("flat");
		expect(trendOf(null)).toBe("flat");
	});
});
