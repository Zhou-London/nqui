import { describe, expect, it } from "vitest";
import { inferSchema } from "../data/data-preview";

describe("inferSchema", () => {
	const rows = [
		{ id: 1, price: 10.5, side: "buy", ts: "2026-09-08T09:30:00Z", maker: true, fee: null },
		{ id: 2, price: 11, side: "sell", ts: "2026-09-08T09:31:00Z", maker: false, fee: 0.2 },
		{ id: 3, price: 9.75, side: "buy", ts: "2026-09-08T09:32:00Z", maker: true, fee: null },
	];
	const schema = inferSchema(rows, { bins: 4 });
	const by = Object.fromEntries(schema.map((c) => [c.name, c]));

	it("detects integer, number, string, date, and boolean columns", () => {
		expect(by.id?.type).toBe("integer");
		expect(by.price?.type).toBe("number");
		expect(by.side?.type).toBe("string");
		expect(by.ts?.type).toBe("date");
		expect(by.maker?.type).toBe("boolean");
	});
	it("computes null counts and numeric stats", () => {
		expect(by.fee?.stats?.nulls).toBe(2);
		expect(by.fee?.nullable).toBe(true);
		expect(by.price?.stats?.min).toBe(9.75);
		expect(by.price?.stats?.max).toBe(11);
		expect(by.price?.stats?.histogram).toHaveLength(4);
		expect(by.price?.stats?.histogram?.reduce((a, b) => a + b, 0)).toBe(3);
	});
	it("collects top values for strings", () => {
		expect(by.side?.stats?.top?.[0]).toEqual({ value: "buy", count: 2 });
	});
	it("handles 200k numeric values without overflowing the stack", () => {
		const big = Array.from({ length: 200_000 }, (_, i) => ({ n: i, s: `v${i % 7}` }));
		const [n, str] = inferSchema(big, { bins: 8 });
		expect(n?.stats?.min).toBe(0);
		expect(n?.stats?.max).toBe(199_999);
		expect(str?.stats?.min).toBe(2);
	});
});
