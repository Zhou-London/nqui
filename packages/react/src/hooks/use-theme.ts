import { useCallback, useEffect, useSyncExternalStore } from "react";

export type ColorScheme = "light" | "dark" | "system";

const STORAGE_KEY = "nqui-color-scheme";
const listeners = new Set<() => void>();

function readStored(): ColorScheme {
	if (typeof window === "undefined") return "system";
	try {
		const v = window.localStorage.getItem(STORAGE_KEY);
		return v === "light" || v === "dark" ? v : "system";
	} catch {
		return "system";
	}
}

function systemPrefersDark(): boolean {
	return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(scheme: ColorScheme): "light" | "dark" {
	return scheme === "system" ? (systemPrefersDark() ? "dark" : "light") : scheme;
}

function apply(scheme: ColorScheme): void {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	const resolved = resolve(scheme);
	root.classList.toggle("dark", resolved === "dark");
	root.dataset.theme = resolved;
	root.style.colorScheme = resolved;
}

function subscribe(cb: () => void): () => void {
	listeners.add(cb);
	const mq = window.matchMedia("(prefers-color-scheme: dark)");
	const onChange = () => {
		if (readStored() === "system") apply("system");
		cb();
	};
	mq.addEventListener("change", onChange);
	return () => {
		listeners.delete(cb);
		mq.removeEventListener("change", onChange);
	};
}

/**
 * Light/dark switching that writes the `.dark` class (and `data-theme`) on `<html>`,
 * persists the choice, and follows the OS preference while set to "system".
 */
export function useTheme(): {
	scheme: ColorScheme;
	resolved: "light" | "dark";
	setScheme: (scheme: ColorScheme) => void;
	toggle: () => void;
} {
	const scheme = useSyncExternalStore(subscribe, readStored, () => "system" as ColorScheme);

	useEffect(() => {
		apply(scheme);
	}, [scheme]);

	const setScheme = useCallback((next: ColorScheme) => {
		try {
			if (next === "system") window.localStorage.removeItem(STORAGE_KEY);
			else window.localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// Private mode or blocked storage: still apply for this session.
		}
		apply(next);
		for (const l of listeners) l();
	}, []);

	const toggle = useCallback(() => {
		setScheme(resolve(readStored()) === "dark" ? "light" : "dark");
	}, [setScheme]);

	return { scheme, resolved: resolve(scheme), setScheme, toggle };
}

/** Inline script text that applies the stored scheme before first paint (drop into <head>). */
export const themeInitScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
	STORAGE_KEY,
)});var d=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.dataset.theme=d?"dark":"light";r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
