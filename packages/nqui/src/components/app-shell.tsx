import type { ComponentProps, ReactNode } from "react";
import { cn } from "../utils/cn";
import { SidebarProvider, useHasSidebarProvider, useSidebarReopenInset } from "./sidebar";

export interface AppShellProps extends ComponentProps<"div"> {
	/** Left column, usually a `Sidebar`. Hidden below `md`; open it in a `Drawer` instead. */
	sidebar?: ReactNode;
	/**
	 * Top bar spanning the content column, usually a transparent `Navbar` holding the
	 * `SidebarTrigger`, breadcrumbs, and the account menu. Content scrolls below it.
	 */
	header?: ReactNode;
	/** Bottom bar for mobile, usually `BottomNav`. */
	footer?: ReactNode;
}

/**
 * Full-height console layout: sidebar, header, scrolling content. Mounts a `SidebarProvider`
 * so a `SidebarTrigger` in the header can hide the sidebar; wrap the shell in your own
 * provider to control that state. A trigger in the header keeps its spot on the top row
 * when the sidebar is hidden, so nothing floats over the page.
 */
export function AppShell({
	sidebar,
	header,
	footer,
	className,
	children,
	...props
}: AppShellProps) {
	const hasProvider = useHasSidebarProvider();
	const shell = (
		<div
			{...props}
			className={cn("flex h-dvh w-full overflow-hidden bg-background text-foreground", className)}
		>
			{sidebar ? <div className="hidden h-full shrink-0 md:block">{sidebar}</div> : null}
			<div className="flex min-w-0 flex-1 flex-col">
				{header}
				<main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
				{footer}
			</div>
		</div>
	);
	return hasProvider || !sidebar ? shell : <SidebarProvider>{shell}</SidebarProvider>;
}

export interface PageHeaderProps extends Omit<ComponentProps<"div">, "title"> {
	title: ReactNode;
	description?: ReactNode;
	/** Breadcrumbs or a back link above the title. */
	eyebrow?: ReactNode;
	/** Buttons on the right. */
	actions?: ReactNode;
	/** Content below the title row, e.g. `Tabs`. */
	tabs?: ReactNode;
}

/** Title row for a console page. */
export function PageHeader({
	title,
	description,
	eyebrow,
	actions,
	tabs,
	className,
	...props
}: PageHeaderProps) {
	const inset = useSidebarReopenInset();
	return (
		<div
			{...props}
			className={cn(
				"mx-auto flex w-full max-w-page flex-col gap-4 px-4 pt-6 transition-[padding] md:px-8",
				inset && "md:pl-16",
				className,
			)}
		>
			{eyebrow}
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="min-w-0">
					<h1 className="font-semibold text-2xl text-foreground tracking-tight">{title}</h1>
					{description ? <p className="mt-1 text-muted text-sm">{description}</p> : null}
				</div>
				{actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
			</div>
			{tabs}
		</div>
	);
}

/**
 * Page body; the top padding is the gap below a `PageHeader` or the shell's top bar. Like
 * `PageHeader` it is centered and capped at `max-w-page` (1200 px) on wide screens.
 */
export function PageContent({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={cn(
				"mx-auto flex w-full max-w-page flex-col gap-6 px-4 pt-6 pb-8 md:px-8",
				className,
			)}
		/>
	);
}
