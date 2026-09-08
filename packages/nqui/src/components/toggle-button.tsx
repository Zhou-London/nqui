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
		"inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap font-medium",
		"transition-[background-color,color,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-45",
		"[&_svg]:pointer-events-none [&_svg]:shrink-0",
	],
	variants: {
		variant: {
			soft: "text-muted hover:bg-surface-2 hover:text-foreground selected:bg-accent-soft selected:text-foreground",
			outline:
				"border border-border bg-surface text-muted hover:bg-surface-2 selected:border-accent selected:bg-accent selected:text-accent-foreground",
			primary: "text-muted hover:bg-surface-2 selected:bg-primary-soft selected:text-primary-text",
		},
		size: {
			sm: "h-8 px-3 text-xs [&_svg]:size-3.5",
			md: "h-9 px-4 text-sm [&_svg]:size-4",
			lg: "h-10 px-5 text-sm [&_svg]:size-4",
		},
		radius: {
			md: "rounded-lg",
			lg: "rounded-xl",
			full: "rounded-full",
		},
		isIconOnly: { true: "px-0" },
	},
	compoundVariants: [
		{ isIconOnly: true, size: "sm", class: "w-8" },
		{ isIconOnly: true, size: "md", class: "w-9" },
		{ isIconOnly: true, size: "lg", class: "w-10" },
	],
	defaultVariants: { variant: "soft", size: "md", radius: "full" },
});

export interface ToggleButtonProps
	extends Omit<AriaToggleButtonProps, "className">,
		VariantProps<typeof toggleButtonStyles> {
	className?: AriaToggleButtonProps["className"];
}

/** Two-state button. Pair several inside `ToggleButtonGroup` for single or multi selection. */
export function ToggleButton({
	variant,
	size,
	radius,
	isIconOnly,
	className,
	...props
}: ToggleButtonProps) {
	return (
		<AriaToggleButton
			{...props}
			className={composeRenderProps(className, (cls, rp) =>
				toggleButtonStyles({ ...rp, variant, size, radius, isIconOnly, className: cls }),
			)}
		/>
	);
}

export interface ToggleButtonGroupProps extends AriaToggleButtonGroupProps {}

export function ToggleButtonGroup({ className, ...props }: ToggleButtonGroupProps) {
	return (
		<AriaToggleButtonGroup
			{...props}
			className={composeRenderProps(className, (cls) =>
				tv({ base: "inline-flex items-center gap-1 rounded-full bg-surface-2 p-1" })({
					className: cls,
				}),
			)}
		/>
	);
}
