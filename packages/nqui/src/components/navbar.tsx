import type { ComponentProps, ReactNode } from "react";
import {
	Link as AriaLink,
	type LinkProps as AriaLinkProps,
	composeRenderProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/focus-ring";
import { tv, type VariantProps } from "../utils/tv";

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
	return <header {...props} className={navbarStyles({ variant, position, className })} />;
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

export function NavbarContent({ justify = "start", className, ...props }: NavbarContentProps) {
	return (
		<nav
			{...props}
			className={cn(
				"flex min-w-0 flex-1 items-center gap-1",
				justify === "center" && "justify-center",
				justify === "end" && "justify-end",
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
	return (
		<AriaLink
			{...props}
			aria-current={isActive ? "page" : undefined}
			className={composeRenderProps(className, (cls) =>
				cn(
					focusRing(),
					"flex h-8 items-center gap-1 rounded-full px-4 font-medium text-muted text-sm transition-colors hover:text-foreground",
					isActive && "bg-accent-soft text-foreground",
					cls,
				),
			)}
		/>
	);
}
