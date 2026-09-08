import type { ReactNode } from "react";
import { I18nProvider, RouterProvider } from "react-aria-components";
import { ToastRegion, type ToastRegionProps } from "../components/toast";

export interface NquiProviderProps {
	children: ReactNode;
	/** BCP 47 locale for dates, numbers, and collation. Defaults to the browser locale. */
	locale?: string;
	/** Client-side navigation for `href` props on links, menu items, and rows. */
	navigate?: (path: string, routerOptions?: object) => void;
	useHref?: (href: string) => string;
	/** Color convention for gains and losses: `us` green-up, `cn` red-up. */
	market?: "us" | "cn";
	/** Where toasts appear; `null` disables the built-in region. */
	toastPlacement?: ToastRegionProps["placement"] | null;
}

/** App-level provider: locale, router integration, market colors, and the toast region. */
export function NquiProvider({
	children,
	locale,
	navigate,
	useHref,
	market,
	toastPlacement = "bottom-right",
}: NquiProviderProps) {
	let content = (
		<>
			{children}
			{toastPlacement ? <ToastRegion placement={toastPlacement} /> : null}
		</>
	);
	if (navigate) {
		content = (
			<RouterProvider navigate={navigate} useHref={useHref}>
				{content}
			</RouterProvider>
		);
	}
	return (
		<I18nProvider locale={locale}>
			<div data-market={market} className="contents">
				{content}
			</div>
		</I18nProvider>
	);
}
