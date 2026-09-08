import { useSyncExternalStore } from "react";

/** Reactive `window.matchMedia`. Returns `false` during server rendering. */
export function useMediaQuery(query: string): boolean {
	return useSyncExternalStore(
		(cb) => {
			const mq = window.matchMedia(query);
			mq.addEventListener("change", cb);
			return () => mq.removeEventListener("change", cb);
		},
		() => window.matchMedia(query).matches,
		() => false,
	);
}

/** True below Tailwind's `md` breakpoint (48rem). */
export function useIsMobile(): boolean {
	return useMediaQuery("(max-width: 47.99rem)");
}
