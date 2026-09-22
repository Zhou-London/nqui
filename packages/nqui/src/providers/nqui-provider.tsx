import { createContext, type ReactNode, useContext, useMemo } from "react";
import { I18nProvider, RouterProvider } from "react-aria-components";
import { ToastRegion, type ToastRegionProps } from "../components/toast";
import { type Density, DensityContext } from "../hooks/use-density";
import type { NquiMessages } from "../i18n/messages";
import { MessagesContext } from "../i18n/use-messages";

/** Set when an outer provider already renders the toast region for the one global queue. */
const ToastRegionContext = createContext(false);

export interface NquiProviderProps {
	children: ReactNode;
	density?: Density;
	/**
	 * BCP 47 locale for dates, numbers, collation, and NQUI's own strings. Defaults to the
	 * browser locale. Pass it when rendering on the server so the markup matches after hydration.
	 */
	locale?: string;
	/**
	 * Overrides for the strings NQUI renders itself (button labels, placeholders, empty states).
	 * English and Simplified Chinese ship built in and follow `locale`; pass a whole catalog to
	 * support another language. Nested providers merge their overrides over the outer ones.
	 */
	messages?: Partial<NquiMessages>;
	/** Client-side navigation for `href` props on links, menu items, and rows. */
	navigate?: (path: string, routerOptions?: object) => void;
	useHref?: (href: string) => string;
	/** Color convention for gains and losses: `us` green-up, `cn` red-up. */
	market?: "us" | "cn";
	/**
	 * Where toasts appear; `null` disables the built-in region. A provider nested inside another
	 * that already shows toasts renders none, so each toast appears once.
	 */
	toastPlacement?: ToastRegionProps["placement"] | null;
}

/** App-level provider: locale, strings, router integration, market colors, and the toast region. */
export function NquiProvider({
	children,
	locale,
	messages,
	navigate,
	useHref,
	market,
	density = "comfortable",
	toastPlacement = "bottom-right",
}: NquiProviderProps) {
	const outerMessages = useContext(MessagesContext);
	const mergedMessages = useMemo(
		() => (messages ? { ...outerMessages, ...messages } : outerMessages),
		[outerMessages, messages],
	);
	const outerHasToasts = useContext(ToastRegionContext);
	const showToasts = toastPlacement != null && !outerHasToasts;
	let content = (
		<ToastRegionContext.Provider value={outerHasToasts || showToasts}>
			{children}
			{showToasts ? <ToastRegion placement={toastPlacement} /> : null}
		</ToastRegionContext.Provider>
	);
	if (navigate) {
		content = (
			<RouterProvider navigate={navigate} useHref={useHref}>
				{content}
			</RouterProvider>
		);
	}
	return (
		<DensityContext.Provider value={density}>
			<MessagesContext.Provider value={mergedMessages}>
				<I18nProvider locale={locale}>
					<div data-market={market} className="contents">
						{content}
					</div>
				</I18nProvider>
			</MessagesContext.Provider>
		</DensityContext.Provider>
	);
}
