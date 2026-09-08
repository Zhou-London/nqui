import { describe, expect, it } from "vitest";
import { sparklinePath } from "../finance/sparkline";

describe("sparklinePath", () => {
	it("maps the extremes to the top and bottom of the box", () => {
		const { points } = sparklinePath([0, 10, 5], 100, 32, false);
		expect(points[0]?.[0]).toBe(0);
		expect(points[2]?.[0]).toBe(100);
		expect(points[1]?.[1]).toBeCloseTo(1.5);
		expect(points[0]?.[1]).toBeCloseTo(30.5);
	});
	it("emits a straight path when smoothing is off and curves when on", () => {
		expect(sparklinePath([1, 2, 3], 100, 20, false).line).toMatch(/^M0.00 .* L100.00 /);
		expect(sparklinePath([1, 2, 3], 100, 20, true).line).toContain(" C");
	});
	it("handles empty input", () => {
		expect(sparklinePath([], 100, 20, true)).toEqual({ line: "", points: [] });
	});
});
