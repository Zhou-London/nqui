import { useSyncExternalStore } from "react";

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

/** True below Tailwind's `md` breakpoint (48rem). */
export function useIsMobile(): boolean {
	return useMediaQuery("(max-width: 47.99rem)");
}
