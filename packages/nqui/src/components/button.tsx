import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	composeRenderProps,
} from "react-aria-components";
import { focusRing } from "../utils/focus-ring";
import { tv, type VariantProps } from "../utils/tv";

export const buttonStyles = tv({
	extend: focusRing,
	base: [
		"relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium",
		"transition-[background-color,color,border-color,box-shadow,transform,opacity] duration-150",
		"disabled:pointer-events-none disabled:opacity-45",
		"pressed:scale-[0.98]",
		"[&_svg]:pointer-events-none [&_svg]:shrink-0",
	],
	variants: {
		variant: {
			solid: "shadow-xs",
			soft: "",
			outline: "border bg-surface shadow-xs",
			ghost: "",
			link: "h-auto px-0 underline-offset-4 hover:underline",
		},
		color: {
			accent: "",
			primary: "",
			neutral: "",
			success: "",
			warning: "",
			danger: "",
			info: "",
		},
		size: {
			xs: "h-7 gap-1 px-2.5 text-xs [&_svg]:size-3.5",
			sm: "h-8 gap-1.5 px-3 text-xs [&_svg]:size-3.5",
			md: "h-9 gap-2 px-4 text-sm [&_svg]:size-4",
			lg: "h-10 gap-2 px-5 text-sm [&_svg]:size-4",
			xl: "h-12 gap-2.5 px-6 text-base [&_svg]:size-5",
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
			class: "bg-accent text-accent-foreground hover:bg-accent/85",
		},
		{
			variant: "solid",
			color: "primary",
			class: "bg-primary text-primary-foreground hover:bg-primary/90",
		},
		{
			variant: "solid",
			color: "neutral",
			class: "bg-neutral text-neutral-foreground shadow-none hover:bg-surface-3",
		},
		{
			variant: "solid",
			color: "success",
			class: "bg-success text-success-foreground hover:bg-success/90",
		},
		{
			variant: "solid",
			color: "warning",
			class: "bg-warning text-warning-foreground hover:bg-warning/90",
		},
		{
			variant: "solid",
			color: "danger",
			class: "bg-danger text-danger-foreground hover:bg-danger/90",
		},
		{ variant: "solid", color: "info", class: "bg-info text-info-foreground hover:bg-info/90" },
		// soft
		{
			variant: "soft",
			color: "accent",
			class: "bg-accent-soft text-accent-text hover:bg-accent/15",
		},
		{
			variant: "soft",
			color: "primary",
			class: "bg-primary-soft text-primary-text hover:bg-primary/20",
		},
		{
			variant: "soft",
			color: "neutral",
			class: "bg-neutral-soft text-neutral-text hover:bg-surface-3",
		},
		{
			variant: "soft",
			color: "success",
			class: "bg-success-soft text-success-text hover:bg-success/25",
		},
		{
			variant: "soft",
			color: "warning",
			class: "bg-warning-soft text-warning-text hover:bg-warning/30",
		},
		{
			variant: "soft",
			color: "danger",
			class: "bg-danger-soft text-danger-text hover:bg-danger/20",
		},
		{ variant: "soft", color: "info", class: "bg-info-soft text-info-text hover:bg-info/25" },
		// outline
		{
			variant: "outline",
			color: "accent",
			class: "border-border text-foreground hover:bg-surface-2",
		},
		{
			variant: "outline",
			color: "neutral",
			class: "border-border text-foreground hover:bg-surface-2",
		},
		{
			variant: "outline",
			color: "primary",
			class: "border-primary/40 text-primary-text hover:bg-primary-soft",
		},
		{
			variant: "outline",
			color: "success",
			class: "border-success/40 text-success-text hover:bg-success-soft",
		},
		{
			variant: "outline",
			color: "warning",
			class: "border-warning/50 text-warning-text hover:bg-warning-soft",
		},
		{
			variant: "outline",
			color: "danger",
			class: "border-danger/40 text-danger-text hover:bg-danger-soft",
		},
		{
			variant: "outline",
			color: "info",
			class: "border-info/40 text-info-text hover:bg-info-soft",
		},
		// ghost
		{ variant: "ghost", color: "accent", class: "text-foreground hover:bg-surface-2" },
		{
			variant: "ghost",
			color: "neutral",
			class: "text-muted hover:bg-surface-2 hover:text-foreground",
		},
		{ variant: "ghost", color: "primary", class: "text-primary-text hover:bg-primary-soft" },
		{ variant: "ghost", color: "success", class: "text-success-text hover:bg-success-soft" },
		{ variant: "ghost", color: "warning", class: "text-warning-text hover:bg-warning-soft" },
		{ variant: "ghost", color: "danger", class: "text-danger-text hover:bg-danger-soft" },
		{ variant: "ghost", color: "info", class: "text-info-text hover:bg-info-soft" },
		// link
		{ variant: "link", color: "accent", class: "text-foreground" },
		{ variant: "link", color: "neutral", class: "text-muted" },
		{ variant: "link", color: "primary", class: "text-primary-text" },
		{ variant: "link", color: "success", class: "text-success-text" },
		{ variant: "link", color: "warning", class: "text-warning-text" },
		{ variant: "link", color: "danger", class: "text-danger-text" },
		{ variant: "link", color: "info", class: "text-info-text" },
		// icon-only squares
		{ isIconOnly: true, size: "xs", class: "w-7" },
		{ isIconOnly: true, size: "sm", class: "w-8" },
		{ isIconOnly: true, size: "md", class: "w-9" },
		{ isIconOnly: true, size: "lg", class: "w-10" },
		{ isIconOnly: true, size: "xl", class: "w-12" },
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
	/** Icon or element rendered before the label. */
	startContent?: ReactNode;
	/** Icon or element rendered after the label. */
	endContent?: ReactNode;
}

/**
 * Pill-shaped button. `color="accent"` is the near-black default; use `primary` for the
 * one blue call to action on a screen.
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
	children,
	className,
	...props
}: ButtonProps) {
	return (
		<AriaButton
			{...props}
			className={composeRenderProps(className, (cls, rp) =>
				buttonStyles({
					...rp,
					variant,
					color,
					size,
					radius,
					isIconOnly,
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
					<span className={isPending ? "contents opacity-0" : "contents"}>
						{startContent}
						{content}
						{endContent}
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
