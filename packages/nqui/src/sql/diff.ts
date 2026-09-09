import type { ChangeSpec } from "@codemirror/state";

/**
 * The smallest single replacement that turns `prev` into `next`, or null when they are equal.
 * Replacing only the differing span keeps the cursor and selection in place when a controlled
 * `value` prop changes.
 */
export function minimalChange(prev: string, next: string): ChangeSpec | null {
	if (prev === next) return null;
	const max = Math.min(prev.length, next.length);
	let start = 0;
	while (start < max && prev.charCodeAt(start) === next.charCodeAt(start)) start++;
	let end = 0;
	while (
		end < max - start &&
		prev.charCodeAt(prev.length - 1 - end) === next.charCodeAt(next.length - 1 - end)
	)
		end++;
	return { from: start, to: prev.length - end, insert: next.slice(start, next.length - end) };
}
