import type { ReactNode } from "react";
import {
	FieldError as AriaFieldError,
	type FieldErrorProps as AriaFieldErrorProps,
	Group as AriaGroup,
	type GroupProps as AriaGroupProps,
	Label as AriaLabel,
	type LabelProps as AriaLabelProps,
	composeRenderProps,
	Text,
	type TextProps,
} from "react-aria-components";
import { useDensity } from "../hooks/use-density";
import { cn } from "../utils/cn";
import { tv, type VariantProps } from "../utils/tv";

export function Label({ className, ...props }: AriaLabelProps) {
	return (
		<AriaLabel
			{...props}
			className={cn(
				"w-fit cursor-default font-medium text-foreground text-sm group-disabled:opacity-50",
				className,
			)}
		/>
	);
}

export function Description({ className, ...props }: TextProps) {
	return <Text {...props} slot="description" className={cn("text-muted text-xs", className)} />;
}

export function FieldError({ className, ...props }: AriaFieldErrorProps) {
	return (
		<AriaFieldError
			{...props}
			className={composeRenderProps(className, (cls) => cn("text-danger-text text-xs", cls))}
		/>
	);
}

/** Shared box styling for every text-like input (input, select trigger, combobox group). */
export const inputBoxStyles = tv({
	base: [
		"group/box flex w-full items-center gap-2 rounded-xl border border-border bg-surface text-foreground text-sm shadow-2xs",
		"transition-[border-color,box-shadow,background-color] duration-150",
		"hover:border-border-strong",
		"focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 focus-within:hover:border-primary",
		"invalid:border-danger invalid:focus-within:ring-danger/25",
		"disabled:pointer-events-none disabled:opacity-50",
	],
	variants: {
		/**
		 * The box is itself the focusable element (a `TextArea`), which only reports
		 * `data-focused`, never `data-focus-within`.
		 */
		focusSelf: {
			true: "focus:border-primary focus:ring-2 focus:ring-primary/25 focus:hover:border-primary invalid:focus:ring-danger/25",
		},
		size: {
			sm: "h-8 px-2 text-xs [&_svg]:size-4",
			md: "h-10 px-4 [&_svg]:size-4",
			lg: "h-12 px-4 [&_svg]:size-5",
		},
		variant: {
			outline: "",
			filled:
				"border-transparent bg-surface-2 shadow-none hover:bg-surface-3 focus-within:bg-surface",
		},
		radius: {
			md: "rounded-lg",
			lg: "rounded-xl",
			full: "rounded-full",
		},
	},
	compoundVariants: [{ variant: "filled", focusSelf: true, class: "focus:bg-surface" }],
	defaultVariants: { size: "md", variant: "outline", radius: "lg" },
});

export type InputBoxVariants = Omit<VariantProps<typeof inputBoxStyles>, "focusSelf">;

export const inputStyles = tv({
	base: "min-w-0 flex-1 bg-transparent text-foreground outline-hidden placeholder:text-subtle disabled:cursor-default",
});

export interface FieldGroupProps extends Omit<AriaGroupProps, "className">, InputBoxVariants {
	className?: AriaGroupProps["className"];
}

/** Box that holds an input plus adornments; drives focus and invalid styling from state. */
export function FieldGroup({ size, variant, radius, className, ...props }: FieldGroupProps) {
	const compact = useDensity() === "compact";
	return (
		<AriaGroup
			{...props}
			className={composeRenderProps(className, (cls) =>
				inputBoxStyles({
					size: size ?? (compact ? "sm" : "md"),
					variant,
					radius: radius ?? (compact ? "md" : "lg"),
					className: cls,
				}),
			)}
		/>
	);
}

/** Layout for the options of a `CheckboxGroup` or `RadioGroup`. */
export const optionListStyles = tv({
	base: "flex gap-2",
	variants: {
		orientation: {
			vertical: "flex-col",
			horizontal: "flex-row flex-wrap gap-x-6",
		},
	},
	defaultVariants: { orientation: "vertical" },
});

export interface FieldProps {
	label?: ReactNode;
	description?: ReactNode;
	errorMessage?: AriaFieldErrorProps["children"];
}

export interface FieldLayoutProps extends Omit<FieldProps, "errorMessage"> {
	/** Shown in the error slot; a function receives no validation state here, so pass a node. */
	errorMessage?: ReactNode;
	/** Marks the layout invalid so `group-invalid:` styles in the control apply. */
	isInvalid?: boolean;
	className?: string;
	children: ReactNode;
}

/**
 * Vertical stack: label, control, description, error, for controls that are not React Aria
 * fields (a chart, a code editor). Inside a React Aria field use that field's own slots.
 */
export function FieldLayout({
	label,
	description,
	errorMessage,
	isInvalid,
	className,
	children,
}: FieldLayoutProps) {
	const invalid = isInvalid ?? Boolean(errorMessage);
	return (
		<div className={cn("group flex flex-col gap-2", className)} data-invalid={invalid || undefined}>
			{label ? <Label>{label}</Label> : null}
			{children}
			{description ? <Description>{description}</Description> : null}
			{errorMessage ? <span className="text-danger-text text-xs">{errorMessage}</span> : null}
		</div>
	);
}
