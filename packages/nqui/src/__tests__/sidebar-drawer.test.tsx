import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "../components/app-shell";
import {
	Sidebar,
	SidebarHeader,
	SidebarItem,
	SidebarProvider,
	SidebarTrigger,
} from "../components/sidebar";

/** Whether the viewport sits below the `md` tier (768 px), where the sidebar is a drawer. */
const viewport = vi.hoisted(() => ({ belowMd: true }));
vi.mock("../hooks/use-media-query", async (importOriginal) => ({
	...(await importOriginal<typeof import("../hooks/use-media-query")>()),
	useBelowBreakpoint: (breakpoint: string) => breakpoint === "md" && viewport.belowMd,
}));

beforeEach(() => {
	viewport.belowMd = true;
});

function navigation(withTrigger = true) {
	return (
		<Sidebar resizable collapsed>
			<SidebarHeader>{withTrigger ? <SidebarTrigger /> : null}</SidebarHeader>
			<SidebarItem href="#orders">Orders</SidebarItem>
		</Sidebar>
	);
}

describe("Sidebar below md", () => {
	it("opens as a drawer from the header trigger and closes from the trigger inside", async () => {
		render(
			<AppShell sidebar={navigation()} header={<SidebarTrigger />}>
				Content
			</AppShell>,
		);
		const trigger = screen.getByRole("button", { name: "Show sidebar" });
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(screen.queryByRole("complementary")).toBeNull();
		fireEvent.click(trigger);
		const dialog = screen.getByRole("dialog", { name: "Sidebar" });
		expect(within(dialog).getByRole("link", { name: "Orders" })).toBeTruthy();
		// Labels stay visible and the drag handle is gone in the drawer.
		expect(within(dialog).getByRole("complementary").hasAttribute("data-collapsed")).toBe(false);
		expect(screen.queryByRole("separator", { name: "Resize sidebar" })).toBeNull();
		// The trigger inside the header closes the drawer, so no extra close button appears.
		expect(within(dialog).queryByRole("button", { name: "Close sidebar" })).toBeNull();
		fireEvent.click(within(dialog).getByRole("button", { name: "Hide sidebar" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	it("adds a close button when the sidebar has no trigger of its own", async () => {
		render(
			<AppShell sidebar={navigation(false)} header={<SidebarTrigger />}>
				Content
			</AppShell>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Show sidebar" }));
		const dialog = screen.getByRole("dialog", { name: "Sidebar" });
		fireEvent.click(within(dialog).getByRole("button", { name: "Close sidebar" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	it("floats a reopen button when no trigger sits outside the sidebar", async () => {
		render(<AppShell sidebar={navigation()}>Content</AppShell>);
		fireEvent.click(screen.getByRole("button", { name: "Show sidebar" }));
		const dialog = screen.getByRole("dialog", { name: "Sidebar" });
		await act(async () => {
			dialog.focus();
		});
		fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(screen.getByRole("button", { name: "Show sidebar" })).toBeTruthy();
	});

	it("keeps the column hide state while the drawer opens and closes", async () => {
		viewport.belowMd = false;
		const onHiddenChange = vi.fn();
		const element = () => (
			<SidebarProvider hidden onHiddenChange={onHiddenChange}>
				<AppShell sidebar={navigation()} header={<SidebarTrigger />}>
					Content
				</AppShell>
			</SidebarProvider>
		);
		const { rerender } = render(element());
		expect(screen.getByRole("complementary").style.width).toBe("0px");
		viewport.belowMd = true;
		rerender(element());
		fireEvent.click(screen.getByRole("button", { name: "Show sidebar" }));
		expect(screen.getByRole("link", { name: "Orders" })).toBeTruthy();
		expect(onHiddenChange).not.toHaveBeenCalled();
		viewport.belowMd = false;
		rerender(element());
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(screen.getByRole("complementary").style.width).toBe("0px");
		viewport.belowMd = true;
		rerender(element());
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(screen.getByRole("button", { name: "Show sidebar" })).toBeTruthy();
	});

	it("restores an uncontrolled hidden column after a drawer round trip", async () => {
		viewport.belowMd = false;
		const element = () => (
			<AppShell sidebar={navigation()} header={<SidebarTrigger />}>
				Content
			</AppShell>
		);
		const { rerender } = render(element());
		// The header trigger is the last one; the sidebar's own comes first in the DOM.
		fireEvent.click(screen.getAllByRole("button", { name: "Hide sidebar" }).at(-1) as HTMLElement);
		expect(screen.getByRole("complementary").style.width).toBe("0px");
		viewport.belowMd = true;
		rerender(element());
		fireEvent.click(screen.getByRole("button", { name: "Show sidebar" }));
		expect(screen.getByRole("dialog", { name: "Sidebar" })).toBeTruthy();
		viewport.belowMd = false;
		rerender(element());
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(screen.getByRole("complementary").style.width).toBe("0px");
	});

	it("closes the drawer when a row inside it is chosen", async () => {
		const onPress = vi.fn();
		render(
			<AppShell
				sidebar={
					<Sidebar>
						<SidebarItem onPress={onPress}>Orders</SidebarItem>
					</Sidebar>
				}
				header={<SidebarTrigger />}
			>
				Content
			</AppShell>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Show sidebar" }));
		fireEvent.click(screen.getByRole("link", { name: "Orders" }));
		expect(onPress).toHaveBeenCalledTimes(1);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	it("works as a drawer without an AppShell", async () => {
		render(navigation());
		fireEvent.click(screen.getByRole("button", { name: "Show sidebar" }));
		expect(screen.getByRole("dialog", { name: "Sidebar" })).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Hide sidebar" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});
});
