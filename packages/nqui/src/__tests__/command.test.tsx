import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommandItem, CommandPalette, useCommandShortcut } from "../components/command";

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

function Shortcut({ onToggle }: { onToggle: () => void }) {
	useCommandShortcut(onToggle);
	return <input aria-label="Editor" />;
}

describe("useCommandShortcut", () => {
	it("toggles on Ctrl+K and ignores keys an editor already handled or that carry no key", () => {
		const onToggle = vi.fn();
		render(<Shortcut onToggle={onToggle} />);
		fireEvent.keyDown(window, { key: "k", ctrlKey: true });
		expect(onToggle).toHaveBeenCalledOnce();

		const input = screen.getByRole("textbox", { name: "Editor" });
		input.addEventListener("keydown", (e) => e.preventDefault(), { once: true });
		fireEvent.keyDown(input, { key: "k", ctrlKey: true });
		expect(onToggle).toHaveBeenCalledOnce();

		// Autofill fires keydown with no key at all.
		window.dispatchEvent(new Event("keydown"));
		expect(onToggle).toHaveBeenCalledOnce();
	});
});
