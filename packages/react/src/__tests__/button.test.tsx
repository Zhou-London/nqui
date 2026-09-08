import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, IconButton } from "../components/button";

describe("Button", () => {
	it("renders the accent pill by default", () => {
		render(<Button>Save</Button>);
		const btn = screen.getByRole("button", { name: "Save" });
		expect(btn.className).toContain("bg-accent");
		expect(btn.className).toContain("rounded-full");
	});
	it("applies variant and color recipes", () => {
		render(
			<Button variant="soft" color="danger">
				Delete
			</Button>,
		);
		const btn = screen.getByRole("button", { name: "Delete" });
		expect(btn.className).toContain("bg-danger-soft");
		expect(btn.className).not.toContain("bg-accent");
	});
	it("merges consumer classes last so they win", () => {
		render(<Button className="rounded-none">Square</Button>);
		const cls = screen.getByRole("button", { name: "Square" }).className;
		expect(cls).toContain("rounded-none");
		expect(cls).not.toContain("rounded-full");
	});
	it("requires an accessible name on icon buttons", () => {
		render(<IconButton aria-label="Settings">⚙</IconButton>);
		expect(screen.getByRole("button", { name: "Settings" })).toBeTruthy();
	});
});
