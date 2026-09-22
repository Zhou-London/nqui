import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ToastRegion, toast, toastQueue } from "../components/toast";

afterEach(() => {
	act(() => toast.clear());
});

describe("toast", () => {
	it("auto-dismisses a plain toast but keeps one with an action until it is handled", () => {
		act(() => {
			toast.success("Saved");
			toast.info("Deleted", undefined, { action: { label: "Undo", onPress: () => {} } });
		});
		const [withAction, plain] = toastQueue.visibleToasts;
		expect(plain?.timeout).toBe(6000);
		expect(withAction?.timeout).toBeUndefined();
	});
	it("still honours an explicit timeout on a toast with an action", () => {
		act(() => {
			toast.info("Deleted", undefined, {
				timeout: 10000,
				action: { label: "Undo", onPress: () => {} },
			});
		});
		expect(toastQueue.visibleToasts[0]?.timeout).toBe(10000);
	});
	it("draws a focus ring on the dismiss and action buttons", () => {
		render(<ToastRegion />);
		act(() => {
			toast.info("Deleted", undefined, { action: { label: "Undo", onPress: () => {} } });
		});
		for (const name of ["Dismiss", "Undo"]) {
			expect(screen.getByRole("button", { name }).className).toContain("focus-visible:ring-2");
		}
	});
});
