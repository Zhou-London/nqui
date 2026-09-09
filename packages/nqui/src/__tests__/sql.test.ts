import { describe, expect, it } from "vitest";
import { minimalChange } from "../sql/diff";
import { createRunSequencer } from "../sql/query-workbench";

describe("minimalChange", () => {
	it("returns null for equal documents", () => {
		expect(minimalChange("select 1", "select 1")).toBeNull();
	});
	it("replaces only the differing span", () => {
		expect(minimalChange("select a from t", "select b from t")).toEqual({
			from: 7,
			to: 8,
			insert: "b",
		});
	});
	it("handles pure insertions and deletions", () => {
		expect(minimalChange("ab", "axb")).toEqual({ from: 1, to: 1, insert: "x" });
		expect(minimalChange("axb", "ab")).toEqual({ from: 1, to: 2, insert: "" });
	});
	it("does not let the suffix overlap the prefix", () => {
		expect(minimalChange("aa", "aaa")).toEqual({ from: 2, to: 2, insert: "a" });
		expect(minimalChange("", "x")).toEqual({ from: 0, to: 0, insert: "x" });
	});
});

describe("createRunSequencer", () => {
	it("only treats the most recent ticket as current", () => {
		const runs = createRunSequencer();
		const first = runs.start();
		expect(runs.isLatest(first)).toBe(true);
		const second = runs.start();
		expect(runs.isLatest(first)).toBe(false);
		expect(runs.isLatest(second)).toBe(true);
	});
	it("keeps a slow first result from overwriting a later one", async () => {
		const runs = createRunSequencer();
		const applied: string[] = [];
		const run = async (label: string, delay: number) => {
			const ticket = runs.start();
			await new Promise((r) => setTimeout(r, delay));
			if (runs.isLatest(ticket)) applied.push(label);
		};
		await Promise.all([run("slow", 20), run("fast", 1)]);
		expect(applied).toEqual(["fast"]);
	});
});
