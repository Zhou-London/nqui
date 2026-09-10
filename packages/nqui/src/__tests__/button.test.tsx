import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button, buttonStyles, IconButton } from "../components/button";

describe("Button", () => {
	it("renders the accent pill by default", () => {
		render(<Button>Save</Button>);
		const btn = screen.getByRole("button", { name: "Save" });
		expect(btn.className).toContain("bg-accent");
		expect(btn.className).toContain("rounded-full");
	});
	it("applies variant and color recipes", () => {
		render(
			<Button variant="soft" color="error">
				Delete
			</Button>,
		);
		const btn = screen.getByRole("button", { name: "Delete" });
		expect(btn.className).toContain("bg-error-soft");
		expect(btn.className).not.toContain("bg-accent");
	});
	it("merges consumer classes last so they win", () => {
		render(<Button className="rounded-none">Square</Button>);
		const cls = screen.getByRole("button", { name: "Square" }).className;
		expect(cls).toContain("rounded-none");
		expect(cls).not.toContain("rounded-full");
	});
	it("styles hover, pressed, and disabled in every variant and color", () => {
		for (const variant of ["solid", "soft", "outline", "ghost", "link"] as const) {
			for (const color of [
				"accent",
				"primary",
				"neutral",
				"success",
				"warning",
				"error",
				"info",
			] as const) {
				const cls = buttonStyles({ variant, color });
				expect(cls, `${variant} ${color}`).toMatch(/hover:/);
				expect(cls, `${variant} ${color}`).toMatch(/pressed:(bg|opacity)-/);
				expect(cls, `${variant} ${color}`).toContain("disabled:pointer-events-none");
			}
		}
	});
	it("shows a spinner and ignores presses while loading", () => {
		const onPress = vi.fn();
		render(
			<Button isLoading onPress={onPress}>
				Save
			</Button>,
		);
		const btn = screen.getByRole("button");
		expect(btn.hasAttribute("data-pending")).toBe(true);
		expect(btn.querySelector(".animate-spin")).not.toBeNull();
		expect(btn.className).toContain("pending:pointer-events-none");
		fireEvent.click(btn);
		expect(onPress).not.toHaveBeenCalled();
	});
	it("scales up on hover and down when pressed", () => {
		const cls = buttonStyles();
		expect(cls).toContain("hover:scale-105");
		expect(cls).toContain("pressed:scale-95");
	});
	it("disables the button and prints the reason on it", () => {
		render(<Button disabledReason="No open orders">Cancel all</Button>);
		const btn = screen.getByRole("button", { name: "Cancel all · No open orders" });
		expect(btn.hasAttribute("disabled")).toBe(true);
	});
	it("widens an icon-only button to show its reason", () => {
		render(
			<IconButton aria-label="Refresh" disabledReason="Feed offline">
				↻
			</IconButton>,
		);
		const btn = screen.getByRole("button", { name: "Refresh" });
		expect(btn.hasAttribute("disabled")).toBe(true);
		expect(btn.textContent).toContain("Feed offline");
		expect(btn.className).not.toContain("w-10");
	});
	it("disables the element and ignores presses when disabled", () => {
		const onPress = vi.fn();
		render(
			<Button isDisabled onPress={onPress}>
				Save
			</Button>,
		);
		const btn = screen.getByRole("button", { name: "Save" });
		expect(btn.hasAttribute("disabled")).toBe(true);
		fireEvent.click(btn);
		expect(onPress).not.toHaveBeenCalled();
	});
	it("requires an accessible name on icon buttons", () => {
		render(<IconButton aria-label="Settings">⚙</IconButton>);
		expect(screen.getByRole("button", { name: "Settings" })).toBeTruthy();
	});
});
