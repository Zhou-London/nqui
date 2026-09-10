import { useSyncExternalStore } from "react";

/** Viewport tiers in pixels; the same values as the Tailwind `xs:` to `xl:` variants. */
export const breakpoints = { xs: 320, sm: 576, md: 768, lg: 992, xl: 1200 } as const;
export type Breakpoint = keyof typeof breakpoints;

const lists = new Map<string, MediaQueryList>();

function mediaQueryList(query: string): MediaQueryList {
	let mq = lists.get(query);
	if (!mq) {
		mq = window.matchMedia(query);
		lists.set(query, mq);
	}
	return mq;
}

/** Reactive `window.matchMedia`. Returns `false` during server rendering. */
export function useMediaQuery(query: string): boolean {
	return useSyncExternalStore(
		(cb) => {
			const mq = mediaQueryList(query);
			mq.addEventListener("change", cb);
			return () => mq.removeEventListener("change", cb);
		},
		() => mediaQueryList(query).matches,
		() => false,
	);
}

/** Media query that matches from `breakpoint` up, like the Tailwind variant of that name. */
export function minWidthQuery(breakpoint: Breakpoint): string {
	return `(min-width: ${breakpoints[breakpoint] / 16}rem)`;
}

/** Media query that matches below `breakpoint`, like the Tailwind `max-*` variant. */
export function maxWidthQuery(breakpoint: Breakpoint): string {
	return `(max-width: ${(breakpoints[breakpoint] - 0.02) / 16}rem)`;
}

/** Current tier: the largest breakpoint the viewport reaches. `xs` during server rendering. */
export function useBreakpoint(): Breakpoint {
	const sm = useMediaQuery(minWidthQuery("sm"));
	const md = useMediaQuery(minWidthQuery("md"));
	const lg = useMediaQuery(minWidthQuery("lg"));
	const xl = useMediaQuery(minWidthQuery("xl"));
	return xl ? "xl" : lg ? "lg" : md ? "md" : sm ? "sm" : "xs";
}

/** True below `md` (768 px). */
export function useIsMobile(): boolean {
	return useMediaQuery(maxWidthQuery("md"));
}

/**
 * True below `lg` (992 px), where controls enlarge their hit areas to 44 px. Components
 * that size rows in JavaScript, like `DataGrid`, read this instead of the CSS variant.
 */
export function useTouchTargets(): boolean {
	return useMediaQuery(maxWidthQuery("lg"));
}
