import type { ComponentProps, ReactNode } from "react";
import { cn } from "../utils/cn";
import { tv, type VariantProps } from "../utils/tv";

export const chipStyles = tv({
	base: "inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-medium leading-none [&_svg]:shrink-0",
	variants: {
		variant: {
			soft: "",
			solid: "",
			outline: "border bg-surface",
			dot: "bg-surface-2 text-foreground",
		},
		color: {
			neutral: "",
			accent: "",
			primary: "",
			success: "",
			warning: "",
			danger: "",
			info: "",
			up: "",
			down: "",
		},
		size: {
			sm: "h-5 px-2 text-xs [&_svg]:size-3",
			md: "h-6 px-2 text-xs [&_svg]:size-4",
			lg: "h-8 px-4 text-sm [&_svg]:size-4",
		},
		radius: {
			sm: "rounded-md",
			md: "rounded-lg",
			full: "rounded-full",
		},
	},
	compoundVariants: [
		{ variant: "soft", color: "neutral", class: "bg-neutral-soft text-neutral-text" },
		{ variant: "soft", color: "accent", class: "bg-accent-soft text-accent-text" },
		{ variant: "soft", color: "primary", class: "bg-primary-soft text-primary-text" },
		{ variant: "soft", color: "success", class: "bg-success-soft text-success-text" },
		{ variant: "soft", color: "warning", class: "bg-warning-soft text-warning-text" },
		{ variant: "soft", color: "danger", class: "bg-danger-soft text-danger-text" },
		{ variant: "soft", color: "info", class: "bg-info-soft text-info-text" },
		{ variant: "soft", color: "up", class: "bg-up-soft text-up-text" },
		{ variant: "soft", color: "down", class: "bg-down-soft text-down-text" },
		{ variant: "solid", color: "neutral", class: "bg-neutral text-neutral-foreground" },
		{ variant: "solid", color: "accent", class: "bg-accent text-accent-foreground" },
		{ variant: "solid", color: "primary", class: "bg-primary text-primary-foreground" },
		{ variant: "solid", color: "success", class: "bg-success text-success-foreground" },
		{ variant: "solid", color: "warning", class: "bg-warning text-warning-foreground" },
		{ variant: "solid", color: "danger", class: "bg-danger text-danger-foreground" },
		{ variant: "solid", color: "info", class: "bg-info text-info-foreground" },
		{ variant: "solid", color: "up", class: "bg-up text-up-foreground" },
		{ variant: "solid", color: "down", class: "bg-down text-down-foreground" },
		{ variant: "outline", color: "neutral", class: "border-border text-muted" },
		{ variant: "outline", color: "accent", class: "border-border-strong text-foreground" },
		{ variant: "outline", color: "primary", class: "border-primary/40 text-primary-text" },
		{ variant: "outline", color: "success", class: "border-success/40 text-success-text" },
		{ variant: "outline", color: "warning", class: "border-warning/50 text-warning-text" },
		{ variant: "outline", color: "danger", class: "border-danger/40 text-danger-text" },
		{ variant: "outline", color: "info", class: "border-info/40 text-info-text" },
		{ variant: "outline", color: "up", class: "border-up/40 text-up-text" },
		{ variant: "outline", color: "down", class: "border-down/40 text-down-text" },
	],
	defaultVariants: { variant: "soft", color: "neutral", size: "md", radius: "full" },
});

const dotColor: Record<NonNullable<ChipVariants["color"]>, string> = {
	neutral: "bg-subtle",
	accent: "bg-accent",
	primary: "bg-primary",
	success: "bg-success",
	warning: "bg-warning",
	danger: "bg-danger",
	info: "bg-info",
	up: "bg-up",
	down: "bg-down",
};

export type ChipVariants = VariantProps<typeof chipStyles>;

export interface ChipProps extends Omit<ComponentProps<"span">, "color">, ChipVariants {
	startContent?: ReactNode;
	endContent?: ReactNode;
}

/**
 * Small tinted label for statuses, categories, and deltas. The `dot` variant prefixes a
 * colored status dot on a neutral background.
 */
export function Chip({
	variant,
	color = "neutral",
	size,
	radius,
	startContent,
	endContent,
	className,
	children,
	...props
}: ChipProps) {
	return (
		<span {...props} className={chipStyles({ variant, color, size, radius, className })}>
			{variant === "dot" ? (
				<span aria-hidden className={cn("size-1.5 rounded-full", dotColor[color])} />
			) : null}
			{startContent}
			{children}
			{endContent}
		</span>
	);
}

export interface BadgeProps extends Omit<ComponentProps<"span">, "content" | "color"> {
	/** Number or short text shown in the bubble. Omit for a plain dot. */
	content?: ReactNode;
	color?: "primary" | "danger" | "success" | "warning" | "neutral";
	placement?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
	/** Hide the badge when `content` is 0 or empty. */
	showZero?: boolean;
	max?: number;
	children: ReactNode;
}

const badgeColor = {
	primary: "bg-primary text-primary-foreground",
	danger: "bg-danger text-danger-foreground",
	success: "bg-success text-success-foreground",
	warning: "bg-warning text-warning-foreground",
	neutral: "bg-foreground text-background",
};

const badgePlacement = {
	"top-right": "-top-1 -right-1",
	"bottom-right": "-bottom-1 -right-1",
	"top-left": "-top-1 -left-1",
	"bottom-left": "-bottom-1 -left-1",
};

/** Count bubble anchored to a child, for unread counts on icons and avatars. */
export function Badge({
	content,
	color = "danger",
	placement = "top-right",
	showZero = false,
	max = 99,
	className,
	children,
	...props
}: BadgeProps) {
	const isNumber = typeof content === "number";
	const hidden = !showZero && (content === 0 || content === "" || content === null);
	const label = isNumber && content > max ? `${max}+` : content;
	return (
		<span {...props} className={cn("relative inline-flex", className)}>
			{children}
			{hidden ? null : (
				<span
					className={cn(
						"absolute z-10 flex items-center justify-center rounded-full ring-2 ring-surface",
						label == null ? "size-2" : "numeric h-4 min-w-4 px-1 font-semibold text-xs",
						badgeColor[color],
						badgePlacement[placement],
					)}
				>
					{label}
				</span>
			)}
		</span>
	);
}
