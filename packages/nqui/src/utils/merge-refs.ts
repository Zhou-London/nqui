"use client";

import { type Ref, type RefCallback, useCallback } from "react";

function assign<T>(ref: Ref<T> | undefined, value: T | null): void {
	if (typeof ref === "function") ref(value);
	else if (ref) ref.current = value;
}

/**
 * One callback ref that feeds two refs, for a component that needs the element itself and
 * must still hand it to the ref its caller passed.
 */
export function useMergedRefs<T>(a: Ref<T> | undefined, b: Ref<T> | undefined): RefCallback<T> {
	return useCallback(
		(value: T | null) => {
			assign(a, value);
			assign(b, value);
		},
		[a, b],
	);
}
