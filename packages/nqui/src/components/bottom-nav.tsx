import type { ComponentProps, ReactNode } from "react";
import {
	Link as AriaLink,
	type LinkProps as AriaLinkProps,
	composeRenderProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/focus-ring";

export interface BottomNavProps extends ComponentProps<"nav"> {
	/** Hide the bar from the `md` tier up, where a sidebar takes over. */
	hideFromMd?: boolean;
}

/** Tab bar pinned to the bottom edge, with safe-area padding. */
export function BottomNav({ hideFromMd, className, ...props }: BottomNavProps) {
	return (
		<nav
			{...props}
			className={cn(
				"glass sticky bottom-0 z-40 flex w-full items-stretch border-t pb-[env(safe-area-inset-bottom)]",
				hideFromMd && "md:hidden",
				className,
			)}
		/>
	);
}

export interface BottomNavItemProps extends Omit<AriaLinkProps, "className" | "children"> {
	className?: string;
	icon: ReactNode;
	label: ReactNode;
	isActive?: boolean;
	badge?: ReactNode;
}

export function BottomNavItem({
	icon,
	label,
	isActive,
	badge,
	className,
	...props
}: BottomNavItemProps) {
	return (
		<AriaLink
			{...props}
			aria-current={isActive ? "page" : undefined}
			className={composeRenderProps(className, (cls) =>
				cn(
					focusRing(),
					"relative flex flex-1 flex-col items-center justify-center gap-1 py-2 font-medium text-muted text-xs transition-colors pressed:opacity-70 [&>svg]:size-5",
					isActive && "text-foreground",
					cls,
				),
			)}
		>
			<span
				className={cn(
					"relative flex h-8 w-12 items-center justify-center rounded-full transition-colors [&>svg]:size-5",
					isActive && "bg-accent-soft",
				)}
			>
				{icon}
				{badge ? <span className="absolute -top-0.5 right-1">{badge}</span> : null}
			</span>
			{label}
		</AriaLink>
	);
}
