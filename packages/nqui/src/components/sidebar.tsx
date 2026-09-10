import type { ComponentProps, ReactNode } from "react";
import {
	Link as AriaLink,
	type LinkProps as AriaLinkProps,
	composeRenderProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/focus-ring";

export interface SidebarProps extends ComponentProps<"aside"> {
	/** Icon-only rail. */
	collapsed?: boolean;
}

/** Vertical navigation column; pair with `AppShell` or place it in a `Drawer` on mobile. */
export function Sidebar({ collapsed, className, ...props }: SidebarProps) {
	return (
		<aside
			{...props}
			data-collapsed={collapsed ? "" : undefined}
			className={cn(
				"group/sidebar flex h-full flex-col border-border border-r bg-surface text-foreground transition-[width] duration-200",
				collapsed ? "w-16" : "w-64",
				className,
			)}
		/>
	);
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={cn(
				"flex min-h-14 items-center gap-2 px-4 group-data-collapsed/sidebar:justify-center group-data-collapsed/sidebar:px-2",
				className,
			)}
		/>
	);
}

export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={cn("flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-2", className)}
		/>
	);
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={cn("mt-auto flex flex-col gap-1 border-border border-t px-2 py-2", className)}
		/>
	);
}

export interface SidebarGroupProps extends Omit<ComponentProps<"div">, "title"> {
	title?: ReactNode;
}

export function SidebarGroup({ title, className, children, ...props }: SidebarGroupProps) {
	return (
		<div {...props} className={cn("flex flex-col gap-1", className)}>
			{title ? (
				<div className="px-4 pb-2 font-medium text-subtle text-xs uppercase tracking-wider group-data-collapsed/sidebar:sr-only">
					{title}
				</div>
			) : null}
			{children}
		</div>
	);
}

export interface SidebarItemProps extends Omit<AriaLinkProps, "className" | "children"> {
	className?: string;
	icon?: ReactNode;
	/** Chip, count, or dot rendered at the end. */
	badge?: ReactNode;
	isActive?: boolean;
	children: ReactNode;
}

/** Navigation row: icon, label, optional badge. Active rows get the soft rounded fill. */
export function SidebarItem({
	icon,
	badge,
	isActive,
	className,
	children,
	...props
}: SidebarItemProps) {
	return (
		<AriaLink
			{...props}
			aria-current={isActive ? "page" : undefined}
			className={composeRenderProps(className, (cls) =>
				cn(
					focusRing(),
					"flex h-10 items-center gap-2 rounded-xl px-4 font-medium text-muted text-sm transition-colors",
					"hover:bg-surface-2 hover:text-foreground pressed:bg-surface-3",
					"group-data-collapsed/sidebar:justify-center group-data-collapsed/sidebar:px-0",
					"[&>svg]:size-5 [&>svg]:shrink-0",
					isActive && "bg-accent-soft text-foreground",
					cls,
				),
			)}
		>
			{icon}
			<span className="flex-1 truncate group-data-collapsed/sidebar:sr-only">{children}</span>
			{badge ? <span className="shrink-0 group-data-collapsed/sidebar:hidden">{badge}</span> : null}
		</AriaLink>
	);
}
