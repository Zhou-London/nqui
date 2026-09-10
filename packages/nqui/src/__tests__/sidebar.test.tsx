import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell, PageHeader } from "../components/app-shell";
import {
	Sidebar,
	SidebarHeader,
	SidebarItem,
	SidebarSubmenu,
	SidebarTrigger,
} from "../components/sidebar";

function aside() {
	return screen.getByRole("complementary") as HTMLElement;
}

describe("Sidebar", () => {
	it("hides on the trigger and comes back from the floating reopen button", () => {
		const onHiddenChange = vi.fn();
		render(
			<Sidebar onHiddenChange={onHiddenChange}>
				<SidebarHeader>
					<SidebarTrigger />
				</SidebarHeader>
				<SidebarItem>Dashboard</SidebarItem>
			</Sidebar>,
		);
		expect(aside().style.width).toBe("256px");
		fireEvent.click(screen.getByRole("button", { name: "Hide sidebar" }));
		expect(onHiddenChange).toHaveBeenCalledWith(true);
		expect(aside().style.width).toBe("0px");
		expect(aside().hasAttribute("data-hidden")).toBe(true);
		// The header trigger is inert now; the floating reopen button is the last one.
		fireEvent.click(screen.getAllByRole("button", { name: "Show sidebar" }).at(-1) as HTMLElement);
		expect(onHiddenChange).toHaveBeenLastCalledWith(false);
		expect(aside().style.width).toBe("256px");
	});

	it("resizes by dragging, by keyboard, and resets on double-click within the limits", () => {
		const onWidthChange = vi.fn();
		render(
			<Sidebar resizable onWidthChange={onWidthChange} minWidth={200} maxWidth={400}>
				<SidebarItem>Dashboard</SidebarItem>
			</Sidebar>,
		);
		const handle = screen.getByRole("separator", { name: "Resize sidebar" });
		expect(handle.getAttribute("aria-valuenow")).toBe("256");
		fireEvent.pointerDown(handle, { button: 0, clientX: 256, pointerId: 1 });
		fireEvent.pointerMove(handle, { clientX: 300, pointerId: 1 });
		fireEvent.pointerUp(handle, { clientX: 300, pointerId: 1 });
		expect(onWidthChange).toHaveBeenLastCalledWith(300);
		expect(aside().style.width).toBe("300px");
		fireEvent.keyDown(handle, { key: "ArrowRight" });
		expect(aside().style.width).toBe("316px");
		fireEvent.keyDown(handle, { key: "End" });
		expect(aside().style.width).toBe("400px");
		fireEvent.keyDown(handle, { key: "Home" });
		expect(aside().style.width).toBe("200px");
		fireEvent.doubleClick(handle);
		expect(aside().style.width).toBe("256px");
	});

	it("keeps the widened handle under the controls beside it below the lg tier", () => {
		render(
			<Sidebar resizable>
				<SidebarItem>Dashboard</SidebarItem>
			</Sidebar>,
		);
		const handle = screen.getByRole("separator", { name: "Resize sidebar" });
		// Rendered before the content and stacked only from lg, so a positioned control that
		// overlaps the 44 px zone paints above it and a tap on it does not start a drag.
		expect(aside().firstElementChild).toBe(handle);
		expect(handle.className).toContain("max-lg:w-11");
		expect(handle.className).toContain("lg:z-10");
		expect(handle.className.split(" ")).not.toContain("z-10");
	});

	it("pads the page header while the floating reopen button is on screen", () => {
		render(
			<AppShell
				sidebar={
					<Sidebar>
						<SidebarTrigger />
					</Sidebar>
				}
			>
				<PageHeader title="Orders" />
			</AppShell>,
		);
		const header = screen
			.getByRole("heading", { name: "Orders" })
			.closest("div.flex-col") as HTMLElement;
		expect(header.className).not.toContain("pl-16");
		fireEvent.click(screen.getByRole("button", { name: "Hide sidebar" }));
		expect(header.className).toContain("pl-16");
	});

	it("keeps a top-bar trigger in place instead of floating a reopen button", () => {
		render(
			<AppShell sidebar={<Sidebar>nav</Sidebar>} header={<SidebarTrigger />}>
				<PageHeader title="Orders" />
			</AppShell>,
		);
		const header = screen
			.getByRole("heading", { name: "Orders" })
			.closest("div.flex-col") as HTMLElement;
		fireEvent.click(screen.getByRole("button", { name: "Hide sidebar" }));
		expect(aside().style.width).toBe("0px");
		// The only way back is the same button on the top bar, so nothing pads the page.
		expect(screen.getAllByRole("button", { name: "Show sidebar" })).toHaveLength(1);
		expect(header.className).not.toContain("pl-16");
		fireEvent.click(screen.getByRole("button", { name: "Show sidebar" }));
		expect(aside().style.width).toBe("256px");
	});
});

describe("SidebarSubmenu", () => {
	it("expands and collapses its children and stays collapsed in the rail", () => {
		const onExpandedChange = vi.fn();
		render(
			<Sidebar>
				<SidebarSubmenu label="Analytics" onExpandedChange={onExpandedChange}>
					<SidebarItem>Reports</SidebarItem>
				</SidebarSubmenu>
				<SidebarItem chevron>Settings</SidebarItem>
			</Sidebar>,
		);
		const trigger = screen.getByRole("button", { name: "Analytics" });
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
		expect(screen.getByText("Reports").closest("[hidden]")).not.toBeNull();
		fireEvent.click(trigger);
		expect(onExpandedChange).toHaveBeenCalledWith(true);
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		expect(screen.getByText("Reports").closest("[hidden]")).toBeNull();
		expect(screen.getByText("Settings").parentElement?.querySelector("svg")).not.toBeNull();
	});
});
