import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommandItem, CommandPalette } from "../components/command";

describe("CommandPalette", () => {
	it("focuses the search box on open so Escape and typing work at once", async () => {
		const onOpenChange = vi.fn();
		render(
			<CommandPalette isOpen onOpenChange={onOpenChange}>
				<CommandItem id="a">Alpha</CommandItem>
			</CommandPalette>,
		);
		const input = screen.getByRole("searchbox", { name: "Search commands" });
		await waitFor(() => expect(document.activeElement).toBe(input));
		fireEvent.keyDown(input, { key: "Escape" });
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
