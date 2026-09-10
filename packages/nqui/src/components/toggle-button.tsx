import {
	ToggleButton as AriaToggleButton,
	ToggleButtonGroup as AriaToggleButtonGroup,
	type ToggleButtonGroupProps as AriaToggleButtonGroupProps,
	type ToggleButtonProps as AriaToggleButtonProps,
	composeRenderProps,
} from "react-aria-components";
import { focusRing } from "../utils/focus-ring";
import { tv, type VariantProps } from "../utils/tv";

export const toggleButtonStyles = tv({
	extend: focusRing,
	base: [
		"relative touch-target inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap font-medium",
		"transition-[background-color,color,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-45",
		"[&_svg]:pointer-events-none [&_svg]:shrink-0",
	],
	variants: {
		variant: {
			soft: "text-muted hover:bg-surface-2 hover:text-foreground",
			outline: "border border-border bg-surface text-muted hover:bg-surface-2",
		},
		color: {
			accent: "",
			primary: "",
		},
		size: {
			sm: "h-8 px-4 text-xs [&_svg]:size-4",
			md: "h-10 px-4 text-sm [&_svg]:size-4",
			lg: "h-12 px-6 text-sm [&_svg]:size-5",
		},
		radius: {
			md: "rounded-lg",
			lg: "rounded-xl",
			full: "rounded-full",
		},
		isIconOnly: { true: "px-0" },
	},
	compoundVariants: [
		{ variant: "soft", color: "accent", class: "selected:bg-accent-soft selected:text-foreground" },
		{
			variant: "soft",
			color: "primary",
			class: "selected:bg-primary-soft selected:text-primary-text",
		},
		{
			variant: "outline",
			color: "accent",
			class: "selected:border-accent selected:bg-accent selected:text-accent-foreground",
		},
		{
			variant: "outline",
			color: "primary",
			class: "selected:border-primary selected:bg-primary selected:text-primary-foreground",
		},
		{ isIconOnly: true, size: "sm", class: "w-8" },
		{ isIconOnly: true, size: "md", class: "w-10" },
		{ isIconOnly: true, size: "lg", class: "w-12" },
	],
	defaultVariants: { variant: "soft", color: "accent", size: "md", radius: "full" },
});

const groupStyles = tv({ base: "inline-flex items-center gap-1 rounded-full bg-surface-2 p-1" });

export interface ToggleButtonProps
	extends Omit<AriaToggleButtonProps, "className">,
		Omit<VariantProps<typeof toggleButtonStyles>, "variant"> {
	/** `primary` is deprecated: it is `variant="soft" color="primary"`. */
	variant?: VariantProps<typeof toggleButtonStyles>["variant"] | "primary";
	className?: AriaToggleButtonProps["className"];
}

/** Two-state button. Pair several inside `ToggleButtonGroup` for single or multi selection. */
export function ToggleButton({
	variant,
	color,
	size,
	radius,
	isIconOnly,
	className,
	...props
}: ToggleButtonProps) {
	const legacy = variant === "primary";
	const resolvedVariant = legacy ? "soft" : variant;
	const resolvedColor = color ?? (legacy ? "primary" : undefined);
	return (
		<AriaToggleButton
			{...props}
			className={composeRenderProps(className, (cls, rp) =>
				toggleButtonStyles({
					...rp,
					variant: resolvedVariant,
					color: resolvedColor,
					size,
					radius,
					isIconOnly,
					className: cls,
				}),
			)}
		/>
	);
}

export interface ToggleButtonGroupProps extends AriaToggleButtonGroupProps {}

export function ToggleButtonGroup({ className, ...props }: ToggleButtonGroupProps) {
	return (
		<AriaToggleButtonGroup
			{...props}
			className={composeRenderProps(className, (cls) => groupStyles({ className: cls }))}
		/>
	);
}
