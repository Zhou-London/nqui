import { describe, expect, it } from "vitest";
import { paginationItems } from "../components/pagination";

describe("paginationItems", () => {
	it("lists every page when they fit", () => {
		expect(paginationItems(2, 5)).toEqual([1, 2, 3, 4, 5]);
	});
	it("collapses the far side with an ellipsis", () => {
		expect(paginationItems(1, 24)).toEqual([1, 2, 3, 4, 5, "…", 24]);
		expect(paginationItems(24, 24)).toEqual([1, "…", 20, 21, 22, 23, 24]);
	});
	it("collapses both sides around the current page", () => {
		expect(paginationItems(12, 24)).toEqual([1, "…", 11, 12, 13, "…", 24]);
	});
});
