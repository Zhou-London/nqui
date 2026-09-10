import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Navbar, NavbarContent, NavbarItem } from "../components/navbar";

describe("Navbar", () => {
	it("scrolls the active item into view when the row overflows", () => {
		const scrollIntoView = vi.fn();
		Element.prototype.scrollIntoView = scrollIntoView;
		const { rerender } = render(
			<Navbar>
				<NavbarContent>
					<NavbarItem href="#a">Writing</NavbarItem>
					<NavbarItem href="#b">About</NavbarItem>
				</NavbarContent>
			</Navbar>,
		);
		expect(scrollIntoView).not.toHaveBeenCalled();
		rerender(
			<Navbar>
				<NavbarContent>
					<NavbarItem href="#a">Writing</NavbarItem>
					<NavbarItem href="#b" isActive>
						About
					</NavbarItem>
				</NavbarContent>
			</Navbar>,
		);
		expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest", inline: "nearest" });
	});

	it("keeps a start row scrollable and an end row at its own width", () => {
		const { container } = render(
			<Navbar>
				<NavbarContent>
					<NavbarItem href="#a">Writing</NavbarItem>
				</NavbarContent>
				<NavbarContent justify="end">
					<NavbarItem href="#b">Account</NavbarItem>
				</NavbarContent>
			</Navbar>,
		);
		const [start, end] = container.querySelectorAll("nav");
		expect(start?.className).toContain("overflow-x-auto");
		expect(end?.className).toContain("ml-auto");
		expect(end?.className).not.toContain("flex-1");
	});
});
