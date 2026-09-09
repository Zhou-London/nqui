import { describe, expect, it } from "vitest";
import { sma, toTime } from "../charts/candlestick-chart";
import { toRgba } from "../charts/theme";

const bar = (time: number, close: number) => ({
	time,
	open: close,
	high: close,
	low: close,
	close,
});

describe("toTime", () => {
	it("passes unix seconds and ISO dates through", () => {
		expect(toTime(1_700_000_000)).toBe(1_700_000_000);
		expect(toTime("2024-01-02")).toBe("2024-01-02");
	});
	it("converts millisecond timestamps to seconds", () => {
		expect(toTime(1_700_000_000_123)).toBe(1_700_000_000);
	});
});

describe("sma", () => {
	it("starts at the first full window and slides", () => {
		const data = [bar(1, 1), bar(2, 2), bar(3, 3), bar(4, 4)];
		expect(sma(data, 2)).toEqual([
			{ time: 2, value: 1.5 },
			{ time: 3, value: 2.5 },
			{ time: 4, value: 3.5 },
		]);
	});
	it("returns nothing when the window is longer than the data", () => {
		expect(sma([bar(1, 1)], 3)).toEqual([]);
	});
});

describe("toRgba", () => {
	it("returns the input unchanged when no canvas context is available", () => {
		// happy-dom has no 2D canvas, so the color must fall through untouched.
		expect(toRgba("oklch(0.5 0.1 200)")).toBe("oklch(0.5 0.1 200)");
		expect(toRgba("#123456", 0.5)).toBe("#123456");
	});
});
