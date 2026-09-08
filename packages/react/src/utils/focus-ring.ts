import { tv } from "./tv";

/** Shared focus treatment: no outline until keyboard focus, then a soft primary ring. */
export const focusRing = tv({
	base: "outline-hidden focus-visible:ring-2 focus-visible:ring-focus/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
});

/** Focus ring drawn inside the element, for cells and rows that must not overflow. */
export const focusRingInset = tv({
	base: "outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus/70",
});
