"use client";

import { ChevronRight } from "lucide-react";
import { type ComponentProps, type ReactNode, useId } from "react";
import { Button, Link } from "react-aria-components";
import { cn } from "../utils/cn";
import { tv, type VariantProps } from "../utils/tv";

export const cardStyles = tv({
	base: "flex flex-col overflow-hidden text-foreground",
	variants: {
		variant: {
			outline: "border border-border bg-surface",
			elevated: "bg-surface shadow-md",
			flat: "bg-surface-2",
			glass: "glass border",
			ghost: "",
		},
		radius: {
			md: "rounded-lg",
			lg: "rounded-xl",
			xl: "rounded-2xl",
			"2xl": "rounded-3xl",
		},
		isPressable: {
			true: [
				"pressable-card relative cursor-pointer transition-[box-shadow,transform,border-color,background-color] hover:border-border-strong hover:shadow-sm",
				// The card's action layer holds focus and press state; the card draws them.
				"has-[[data-card-action][data-pressed]]:scale-[0.995]",
				"has-[[data-card-action][data-focus-visible]]:ring-2 has-[[data-card-action][data-focus-visible]]:ring-focus/70 has-[[data-card-action][data-focus-visible]]:ring-offset-2 has-[[data-card-action][data-focus-visible]]:ring-offset-background",
			],
		},
	},
	compoundVariants: [
		{ variant: "flat", isPressable: true, class: "hover:bg-surface-3 hover:shadow-none" },
		{ variant: "ghost", isPressable: true, class: "hover:bg-surface-2 hover:shadow-none" },
	],
	defaultVariants: { variant: "outline", radius: "xl" },
});

const cardActionClass = "absolute inset-0 -z-1 cursor-pointer rounded-[inherit] outline-hidden";

export interface CardProps
	extends Omit<ComponentProps<"div">, "onClick">,
		VariantProps<typeof cardStyles> {
	onPress?: () => void;
	/** Render the whole card as a link. Implies `isPressable`. */
	href?: string;
	target?: string;
}

/**
 * White surface with a hairline border; the basic building block of every dashboard.
 *
 * A pressable card (`onPress` or `href`) renders its action as a button or link that fills the
 * card beneath the content, so buttons and links inside the card keep working and stay visible
 * to screen readers. Name the action with `aria-label` (or `aria-labelledby`); without one it is
 * named by the card's whole text.
 */
export function Card({
	variant,
	radius,
	isPressable,
	onPress,
	href,
	target,
	className,
	children,
	id,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledby,
	...props
}: CardProps) {
	const autoId = useId();
	const cardId = id ?? autoId;
	const pressable = isPressable ?? (onPress != null || href != null);
	const cls = cardStyles({ variant, radius, isPressable: pressable, className });
	if (!pressable) {
		return (
			// A plain card passes labels through untouched, e.g. for `role="region"`.
			<div
				{...props}
				{...{ id, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby }}
				className={cls}
			>
				{children}
			</div>
		);
	}
	const name =
		ariaLabel != null
			? { "aria-label": ariaLabel }
			: { "aria-labelledby": ariaLabelledby ?? cardId };
	return (
		<div {...props} id={cardId} className={cls}>
			{href ? (
				<Link
					{...name}
					data-card-action=""
					href={href}
					target={target}
					onPress={onPress}
					className={cardActionClass}
				/>
			) : (
				<Button
					{...name}
					slot={null}
					data-card-action=""
					onPress={onPress}
					className={cardActionClass}
				/>
			)}
			{children}
		</div>
	);
}

export interface CardSectionProps extends ComponentProps<"div"> {}

export function CardHeader({ className, ...props }: CardSectionProps) {
	return (
		<div
			{...props}
			className={cn("flex items-start justify-between gap-4 px-6 pt-6 pb-2", className)}
		/>
	);
}

export function CardBody({ className, ...props }: CardSectionProps) {
	return <div {...props} className={cn("flex-1 px-6 py-2 first:pt-6 last:pb-6", className)} />;
}

export function CardFooter({ className, ...props }: CardSectionProps) {
	return <div {...props} className={cn("flex items-center gap-2 px-6 pt-2 pb-6", className)} />;
}

export interface CardTitleProps extends ComponentProps<"h3"> {
	description?: ReactNode;
}

export function CardTitle({ description, className, children, ...props }: CardTitleProps) {
	return (
		<div className="min-w-0">
			<h3 {...props} className={cn("truncate font-semibold text-base text-foreground", className)}>
				{children}
			</h3>
			{description ? <p className="mt-1 text-muted text-sm">{description}</p> : null}
		</div>
	);
}

const cardIconStyles = tv({
	base: "flex shrink-0 items-center justify-center rounded-xl [&_svg]:shrink-0",
	variants: {
		size: {
			sm: "size-8 [&_svg]:size-4",
			md: "size-10 [&_svg]:size-5",
			lg: "size-12 rounded-2xl [&_svg]:size-6",
		},
		color: {
			neutral: "bg-surface-2 text-foreground",
			primary: "bg-primary-soft text-primary-text",
			success: "bg-success-soft text-success-text",
			warning: "bg-warning-soft text-warning-text",
			error: "bg-error-soft text-error-text",
			info: "bg-info-soft text-info-text",
		},
	},
	defaultVariants: { size: "md", color: "neutral" },
});

export interface CardIconProps
	extends Omit<ComponentProps<"span">, "color">,
		VariantProps<typeof cardIconStyles> {}

/** Tinted square tile that holds one icon, for the leading slot of a `CardRow`. */
export function CardIcon({ size, color, className, ...props }: CardIconProps) {
	return <span {...props} aria-hidden className={cardIconStyles({ size, color, className })} />;
}

export interface CardRowProps extends Omit<CardProps, "title"> {
	/** Leading icon; wrapped in a `CardIcon` unless you pass a `CardIcon` yourself. */
	icon?: ReactNode;
	iconColor?: CardIconProps["color"];
	title: ReactNode;
	description?: ReactNode;
	/** Trailing slot: a button, chip, switch, or menu trigger. */
	endContent?: ReactNode;
	/** Chevron at the end. Defaults to on for pressable rows and links without `endContent`. */
	showChevron?: boolean;
	/** Row density. */
	size?: "sm" | "md";
}

function isCardIcon(node: ReactNode): boolean {
	return (
		typeof node === "object" &&
		node !== null &&
		"type" in node &&
		(node as { type?: unknown }).type === CardIcon
	);
}

/**
 * One-line settings row: icon tile, title with description, and a trailing action.
 * Stack several in a `CardStack` for a preferences page or a device list.
 */
export function CardRow({
	icon,
	iconColor,
	title,
	description,
	endContent,
	showChevron,
	size = "md",
	className,
	...props
}: CardRowProps) {
	const titleId = useId();
	const pressable = props.isPressable ?? (props.onPress != null || props.href != null);
	const chevron = showChevron ?? (pressable && endContent == null);
	// A pressable row is named by its title rather than by all of its text.
	const labelledBy =
		pressable && props["aria-label"] == null ? (props["aria-labelledby"] ?? titleId) : undefined;
	return (
		<Card
			{...props}
			aria-labelledby={labelledBy ?? props["aria-labelledby"]}
			className={cn(
				"flex-row items-center",
				size === "sm" ? "gap-4 px-4 py-2" : "gap-4 px-6 py-4",
				className,
			)}
		>
			{icon == null ? null : isCardIcon(icon) ? (
				icon
			) : (
				<CardIcon size={size === "sm" ? "sm" : "md"} color={iconColor}>
					{icon}
				</CardIcon>
			)}
			<div className="min-w-0 flex-1">
				<div
					id={titleId}
					className="flex flex-wrap items-center gap-2 font-medium text-base text-foreground leading-tight"
				>
					{title}
				</div>
				{description ? <p className="mt-1 text-muted text-sm">{description}</p> : null}
			</div>
			{endContent == null ? null : (
				<div className="flex shrink-0 items-center gap-2">{endContent}</div>
			)}
			{chevron ? <ChevronRight aria-hidden className="size-4 shrink-0 text-subtle" /> : null}
		</Card>
	);
}

export interface CardStackProps extends ComponentProps<"div"> {
	/** Space between cards. */
	gap?: "sm" | "md";
}

/** Vertical list of cards with even spacing. */
export function CardStack({ gap = "md", className, ...props }: CardStackProps) {
	return (
		<div {...props} className={cn("flex flex-col", gap === "sm" ? "gap-2" : "gap-4", className)} />
	);
}
