import { type ComponentProps, type ReactNode, useEffect, useRef } from "react";
import {
	Link as AriaLink,
	type LinkProps as AriaLinkProps,
	composeRenderProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/focus-ring";
import { tv, type VariantProps } from "../utils/tv";
import { useSidebarReopenInset } from "./sidebar";

const navbarStyles = tv({
	base: "z-40 flex h-14 w-full items-center gap-4 px-4 md:px-6",
	variants: {
		variant: {
			glass: "glass border-b",
			solid: "border-border border-b bg-surface",
			transparent: "",
			floating:
				"glass mx-auto mt-4 h-12 w-[calc(100%-2rem)] max-w-5xl rounded-full border shadow-sm",
		},
		position: {
			sticky: "sticky top-0",
			fixed: "fixed top-0",
			static: "static",
		},
	},
	defaultVariants: { variant: "glass", position: "sticky" },
});

export interface NavbarProps extends ComponentProps<"header">, VariantProps<typeof navbarStyles> {}

/** Top bar. `floating` reproduces the detached pill navigation used on marketing pages. */
export function Navbar({ variant, position, className, ...props }: NavbarProps) {
	const inset = useSidebarReopenInset();
	return (
		<header
			{...props}
			className={navbarStyles({
				variant,
				position,
				className: cn("transition-[padding]", inset && "pl-16", className),
			})}
		/>
	);
}

export function NavbarBrand({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={cn("flex shrink-0 items-center gap-2 font-semibold text-foreground", className)}
		/>
	);
}

export interface NavbarContentProps extends ComponentProps<"nav"> {
	justify?: "start" | "center" | "end";
}

/**
 * Row of items. `start` and `center` rows take the free width and scroll sideways once
 * the items outgrow it, instead of running under their neighbors; an `end` row keeps its
 * own width at the trailing edge.
 */
export function NavbarContent({ justify = "start", className, ...props }: NavbarContentProps) {
	return (
		<nav
			{...props}
			className={cn(
				"flex items-center gap-1",
				justify === "end" ? "ml-auto shrink-0" : "no-scrollbar min-w-0 flex-1 overflow-x-auto",
				justify === "center" && "justify-center-safe",
				className,
			)}
		/>
	);
}

export interface NavbarItemProps extends Omit<AriaLinkProps, "className"> {
	className?: string;
	isActive?: boolean;
	children?: ReactNode;
}

export function NavbarItem({ isActive, className, ...props }: NavbarItemProps) {
	// A row that scrolls sideways keeps the current page's item in view.
	const ref = useRef<HTMLAnchorElement>(null);
	useEffect(() => {
		if (isActive) ref.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
	}, [isActive]);
	return (
		<AriaLink
			{...props}
			ref={ref}
			aria-current={isActive ? "page" : undefined}
			className={composeRenderProps(className, (cls) =>
				cn(
					focusRing(),
					"relative touch-target flex h-8 shrink-0 items-center gap-1 rounded-full px-4 font-medium text-muted text-sm transition-colors hover:text-foreground",
					isActive && "bg-accent-soft text-foreground",
					cls,
				),
			)}
		/>
	);
}
