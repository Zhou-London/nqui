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
		size: {
			sm: "h-8 px-2.5 text-xs [&_svg]:size-3.5",
			md: "h-9 px-3 [&_svg]:size-4",
			lg: "h-10 px-3.5 [&_svg]:size-4",
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
	defaultVariants: { size: "md", variant: "outline", radius: "lg" },
});

export type InputBoxVariants = VariantProps<typeof inputBoxStyles>;

export const inputStyles = tv({
	base: "min-w-0 flex-1 bg-transparent text-foreground outline-hidden placeholder:text-subtle disabled:cursor-default",
});

export interface FieldGroupProps extends Omit<AriaGroupProps, "className">, InputBoxVariants {
	className?: string;
}

/** Box that holds an input plus adornments; drives focus and invalid styling from state. */
export function FieldGroup({ size, variant, radius, className, ...props }: FieldGroupProps) {
	return (
		<AriaGroup
			{...props}
			className={composeRenderProps(className, (cls) =>
				inputBoxStyles({ size, variant, radius, className: cls }),
			)}
		/>
	);
}

export interface FieldProps {
	label?: ReactNode;
	description?: ReactNode;
	errorMessage?: AriaFieldErrorProps["children"];
}

/** Vertical stack: label, control, description, error. */
export function FieldLayout({
	label,
	description,
	errorMessage,
	className,
	children,
}: FieldProps & { className?: string; children: ReactNode }) {
	return (
		<div className={cn("group flex flex-col gap-1.5", className)}>
			{label ? <Label>{label}</Label> : null}
			{children}
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
		</div>
	);
}
