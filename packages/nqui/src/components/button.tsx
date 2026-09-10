import { LoaderCircle } from "lucide-react";
import type { ReactNode, Ref } from "react";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	composeRenderProps,
} from "react-aria-components";
import { useDensity } from "../hooks/use-density";
import { focusRing } from "../utils/focus-ring";
import { tv, type VariantProps } from "../utils/tv";

export const buttonStyles = tv({
	extend: focusRing,
	base: [
		"relative touch-target inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium",
		"transition-[background-color,color,border-color,box-shadow,transform,opacity] duration-150",
		"disabled:pointer-events-none disabled:opacity-45",
		"pending:pointer-events-none",
		"hover:scale-105 pressed:scale-95",
		"[&_svg]:pointer-events-none [&_svg]:shrink-0",
	],
	variants: {
		variant: {
			solid: "shadow-xs",
			soft: "",
			outline: "border bg-surface shadow-xs",
			ghost: "",
			// Inline in text, so no enlarged hit area: it would cover the neighboring lines.
			link: "h-auto px-0 underline-offset-4 before:hidden hover:underline pressed:opacity-70",
		},
		color: {
			accent: "",
			primary: "",
			neutral: "",
			success: "",
			warning: "",
			error: "",
			info: "",
		},
		size: {
			xs: "h-6 gap-1 px-2 text-xs [&_svg]:size-4",
			sm: "h-8 gap-1 px-4 text-xs [&_svg]:size-4",
			md: "h-10 gap-2 px-4 text-sm [&_svg]:size-4",
			lg: "h-12 gap-2 px-6 text-sm [&_svg]:size-5",
			xl: "h-14 gap-2 px-8 text-base [&_svg]:size-6",
		},
		radius: {
			sm: "rounded-md",
			md: "rounded-lg",
			lg: "rounded-xl",
			full: "rounded-full",
		},
		isIconOnly: {
			true: "px-0",
		},
		fullWidth: {
			true: "flex w-full",
		},
	},
	compoundVariants: [
		// solid
		{
			variant: "solid",
			color: "accent",
			class: "bg-accent text-accent-foreground hover:bg-accent/85 pressed:bg-accent/75",
		},
		{
			variant: "solid",
			color: "primary",
			class: "bg-primary text-primary-foreground hover:bg-primary/90 pressed:bg-primary/80",
		},
		{
			variant: "solid",
			color: "neutral",
			class:
				"bg-neutral text-neutral-foreground shadow-none hover:bg-surface-3 pressed:bg-border-strong",
		},
		{
			variant: "solid",
			color: "success",
			class: "bg-success text-success-foreground hover:bg-success/90 pressed:bg-success/80",
		},
		{
			variant: "solid",
			color: "warning",
			class: "bg-warning text-warning-foreground hover:bg-warning/90 pressed:bg-warning/80",
		},
		{
			variant: "solid",
			color: "error",
			class: "bg-error text-error-foreground hover:bg-error/90 pressed:bg-error/80",
		},
		{
			variant: "solid",
			color: "info",
			class: "bg-info text-info-foreground hover:bg-info/90 pressed:bg-info/80",
		},
		// soft
		{
			variant: "soft",
			color: "accent",
			class: "bg-accent-soft text-accent-text hover:bg-accent/15 pressed:bg-accent/20",
		},
		{
			variant: "soft",
			color: "primary",
			class: "bg-primary-soft text-primary-text hover:bg-primary/20 pressed:bg-primary/30",
		},
		{
			variant: "soft",
			color: "neutral",
			class: "bg-neutral-soft text-neutral-text hover:bg-surface-3 pressed:bg-border-strong",
		},
		{
			variant: "soft",
			color: "success",
			class: "bg-success-soft text-success-text hover:bg-success/25 pressed:bg-success/35",
		},
		{
			variant: "soft",
			color: "warning",
			class: "bg-warning-soft text-warning-text hover:bg-warning/30 pressed:bg-warning/40",
		},
		{
			variant: "soft",
			color: "error",
			class: "bg-error-soft text-error-text hover:bg-error/20 pressed:bg-error/30",
		},
		{
			variant: "soft",
			color: "info",
			class: "bg-info-soft text-info-text hover:bg-info/25 pressed:bg-info/35",
		},
		// outline
		{
			variant: "outline",
			color: "accent",
			class: "border-border text-foreground hover:bg-surface-2 pressed:bg-surface-3",
		},
		{
			variant: "outline",
			color: "neutral",
			class: "border-border text-foreground hover:bg-surface-2 pressed:bg-surface-3",
		},
		{
			variant: "outline",
			color: "primary",
			class: "border-primary/40 text-primary-text hover:bg-primary-soft pressed:bg-primary/20",
		},
		{
			variant: "outline",
			color: "success",
			class: "border-success/40 text-success-text hover:bg-success-soft pressed:bg-success/25",
		},
		{
			variant: "outline",
			color: "warning",
			class: "border-warning/50 text-warning-text hover:bg-warning-soft pressed:bg-warning/30",
		},
		{
			variant: "outline",
			color: "error",
			class: "border-error/40 text-error-text hover:bg-error-soft pressed:bg-error/20",
		},
		{
			variant: "outline",
			color: "info",
			class: "border-info/40 text-info-text hover:bg-info-soft pressed:bg-info/25",
		},
		// ghost
		{
			variant: "ghost",
			color: "accent",
			class: "text-foreground hover:bg-surface-2 pressed:bg-surface-3",
		},
		{
			variant: "ghost",
			color: "neutral",
			class: "text-muted hover:bg-surface-2 hover:text-foreground pressed:bg-surface-3",
		},
		{
			variant: "ghost",
			color: "primary",
			class: "text-primary-text hover:bg-primary-soft pressed:bg-primary/20",
		},
		{
			variant: "ghost",
			color: "success",
			class: "text-success-text hover:bg-success-soft pressed:bg-success/25",
		},
		{
			variant: "ghost",
			color: "warning",
			class: "text-warning-text hover:bg-warning-soft pressed:bg-warning/30",
		},
		{
			variant: "ghost",
			color: "error",
			class: "text-error-text hover:bg-error-soft pressed:bg-error/20",
		},
		{
			variant: "ghost",
			color: "info",
			class: "text-info-text hover:bg-info-soft pressed:bg-info/25",
		},
		// link
		{ variant: "link", color: "accent", class: "text-foreground" },
		{ variant: "link", color: "neutral", class: "text-muted" },
		{ variant: "link", color: "primary", class: "text-primary-text" },
		{ variant: "link", color: "success", class: "text-success-text" },
		{ variant: "link", color: "warning", class: "text-warning-text" },
		{ variant: "link", color: "error", class: "text-error-text" },
		{ variant: "link", color: "info", class: "text-info-text" },
		// icon-only squares
		{ isIconOnly: true, size: "xs", class: "w-6" },
		{ isIconOnly: true, size: "sm", class: "w-8" },
		{ isIconOnly: true, size: "md", class: "w-10" },
		{ isIconOnly: true, size: "lg", class: "w-12" },
		{ isIconOnly: true, size: "xl", class: "w-14" },
	],
	defaultVariants: {
		variant: "solid",
		color: "accent",
		size: "md",
		radius: "full",
	},
});

export type ButtonVariants = VariantProps<typeof buttonStyles>;

export interface ButtonProps extends Omit<AriaButtonProps, "className">, ButtonVariants {
	className?: AriaButtonProps["className"];
	/** The underlying `<button>` element. */
	ref?: Ref<HTMLButtonElement>;
	/**
	 * Loading state: shows a spinner in place of the label, keeps the button's size, and
	 * ignores presses. Same as React Aria's `isPending`.
	 */
	isLoading?: boolean;
	/**
	 * Why the button is disabled. Disables the button and prints the reason on the button
	 * itself after the label, in lighter text. An icon-only button widens to show it.
	 */
	disabledReason?: ReactNode;
	/** Icon or element rendered before the label. */
	startContent?: ReactNode;
	/** Icon or element rendered after the label. */
	endContent?: ReactNode;
}

/**
 * Pill-shaped button. `color="accent"` is the near-black default; use `primary` for the
 * one blue call to action on a screen.
 *
 * Five states, each with its own look in every variant: default, hover (`hover:` fill,
 * scaled to 1.05), pressed (a deeper fill, scaled to 0.95), loading (`isLoading`: spinner,
 * presses ignored), and disabled (`isDisabled`: faded, no pointer events; `disabledReason`
 * prints why on the button).
 */
export function Button({
	variant,
	color,
	size,
	radius,
	isIconOnly,
	fullWidth,
	startContent,
	endContent,
	isLoading,
	isPending,
	isDisabled,
	disabledReason,
	children,
	className,
	...props
}: ButtonProps) {
	const compact = useDensity() === "compact";
	const disabled = isDisabled || disabledReason != null;
	const inlineReason = disabled && disabledReason != null;
	return (
		<AriaButton
			{...props}
			isDisabled={disabled}
			isPending={isPending ?? isLoading}
			className={composeRenderProps(className, (cls, rp) =>
				buttonStyles({
					...rp,
					variant,
					color,
					size: size ?? (compact ? "sm" : "md"),
					radius: radius ?? (compact ? "md" : "full"),
					// The reason needs room, so an icon-only button widens into a regular pill.
					isIconOnly: isIconOnly && !inlineReason,
					fullWidth,
					className: cls,
				}),
			)}
		>
			{composeRenderProps(children, (content, { isPending }) => (
				<>
					{isPending ? (
						<span className="absolute inset-0 flex items-center justify-center">
							<LoaderCircle aria-hidden className="animate-spin" />
						</span>
					) : null}
					<span
						className={
							isPending
								? "inline-flex w-full min-w-0 items-center [justify-content:inherit] gap-[inherit] opacity-0"
								: "inline-flex w-full min-w-0 items-center [justify-content:inherit] gap-[inherit]"
						}
					>
						{startContent}
						{content}
						{endContent}
						{inlineReason ? (
							<span className="truncate font-normal opacity-70">
								{isIconOnly ? disabledReason : <>· {disabledReason}</>}
							</span>
						) : null}
					</span>
				</>
			))}
		</AriaButton>
	);
}

export interface IconButtonProps
	extends Omit<ButtonProps, "isIconOnly" | "startContent" | "endContent"> {
	/** Required: icon-only buttons have no visible text. */
	"aria-label": string;
}

/** Square button that holds a single icon. Defaults to the quiet ghost style. */
export function IconButton({ variant = "ghost", color = "neutral", ...props }: IconButtonProps) {
	return <Button {...props} variant={variant} color={color} isIconOnly />;
}

export interface ButtonGroupProps {
	children: ReactNode;
	className?: string;
	/** Attach the buttons into one segmented pill. */
	attached?: boolean;
}

const buttonGroupStyles = tv({
	base: "m-0 inline-flex min-w-0 items-center border-0 p-0",
	variants: {
		attached: {
			true: "[&>*]:rounded-none [&>*:first-child]:rounded-l-full [&>*:last-child]:rounded-r-full [&>*:not(:first-child)]:-ml-px [&>*]:shadow-none",
			false: "gap-2",
		},
	},
});

/** Row of related buttons. With `attached`, borders collapse into a single control. */
export function ButtonGroup({ children, className, attached = true }: ButtonGroupProps) {
	return <fieldset className={buttonGroupStyles({ attached, className })}>{children}</fieldset>;
}
