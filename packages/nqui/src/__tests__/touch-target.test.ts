import { describe, expect, it } from "vitest";
import { buttonStyles } from "../components/button";
import { inputBoxStyles } from "../components/field";
import { listItemStyles } from "../components/listbox";
import { tagStyles } from "../components/tag-group";
import { toggleButtonStyles } from "../components/toggle-button";

/**
 * Guards the touch target rule: below the lg tier (992 px) every control offers at least 44 x 44 px.
 * Controls with a smaller visual box carry `touch-target`, which adds an invisible centered
 * hit area below the lg tier; contiguous rows grow to 44 px instead.
 */
describe("touch targets", () => {
	it("gives the shared control recipes a 44 px hit area below the lg tier (992 px)", () => {
		for (const size of ["xs", "sm", "md"] as const) {
			expect(buttonStyles({ size })).toContain("touch-target");
		}
		expect(buttonStyles({ variant: "link" })).toContain("before:hidden");
		expect(toggleButtonStyles({ size: "sm" })).toContain("touch-target");
		expect(tagStyles()).toContain("touch-target");
	});

	it("grows contiguous rows and field boxes to 44 px below the lg tier (992 px)", () => {
		expect(listItemStyles()).toContain("max-lg:min-h-11");
		expect(inputBoxStyles({ size: "sm" })).toContain("max-lg:min-h-11");
		expect(inputBoxStyles({ size: "md" })).toContain("max-lg:min-h-11");
	});
});
