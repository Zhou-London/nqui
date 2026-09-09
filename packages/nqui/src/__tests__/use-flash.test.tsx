import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFlash } from "../hooks/use-flash";

describe("useFlash", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("reports the direction of the last change and resets after the window", () => {
		const { result, rerender } = renderHook(({ v }) => useFlash(v, 500), {
			initialProps: { v: 1 },
		});
		expect(result.current).toBe("flat");
		rerender({ v: 2 });
		expect(result.current).toBe("up");
		act(() => vi.advanceTimersByTime(500));
		expect(result.current).toBe("flat");
	});
	it("still resets when the duration changes mid-flash", () => {
		const { result, rerender } = renderHook(({ v, d }) => useFlash(v, d), {
			initialProps: { v: 1, d: 500 },
		});
		rerender({ v: 0, d: 500 });
		expect(result.current).toBe("down");
		rerender({ v: 0, d: 100 });
		act(() => vi.advanceTimersByTime(500));
		expect(result.current).toBe("flat");
	});
});
