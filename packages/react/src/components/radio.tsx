import type { ReactNode } from "react";
import {
	Radio as AriaRadio,
	RadioGroup as AriaRadioGroup,
	type RadioGroupProps as AriaRadioGroupProps,
	type RadioProps as AriaRadioProps,
	composeRenderProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { tv, type VariantProps } from "../utils/tv";
import { Description, FieldError, type FieldProps, Label } from "./field";

const dotStyles = tv({
	base: [
		"flex shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface shadow-2xs",
		"transition-[border-color,border-width,box-shadow] duration-150",
		"group-hover:border-subtle group-pressed:scale-95",
		"group-focus-visible:ring-2 group-focus-visible:ring-focus/70 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background",
		"group-invalid:border-danger group-disabled:opacity-50",
	],
	variants: {
		color: {
			accent: "group-selected:border-accent group-selected:border-[5px]",
			primary: "group-selected:border-primary group-selected:border-[5px]",
		},
		size: {
			sm: "size-4",
			md: "size-[1.125rem]",
			lg: "size-5",
		},
	},
	defaultVariants: { color: "primary", size: "md" },
});

export interface RadioProps
	extends Omit<AriaRadioProps, "className" | "children">,
		VariantProps<typeof dotStyles> {
	className?: string;
	children?: ReactNode;
	description?: ReactNode;
}

export function Radio({ color, size, className, children, description, ...props }: RadioProps) {
	return (
		<AriaRadio
			{...props}
			className={composeRenderProps(className, (cls) =>
				cn(
					"group flex cursor-default items-start gap-2.5 text-foreground text-sm disabled:opacity-60",
					cls,
				),
			)}
		>
			<span className={dotStyles({ color, size, className: description ? "mt-0.5" : "" })} />
			{children || description ? (
				<span className="flex flex-col gap-0.5">
					<span>{children}</span>
					{description ? <span className="text-muted text-xs">{description}</span> : null}
				</span>
			) : null}
		</AriaRadio>
	);
}

export interface RadioGroupProps
	extends Omit<AriaRadioGroupProps, "className" | "children">,
		FieldProps {
	className?: string;
	children: ReactNode;
}

export function RadioGroup({
	label,
	description,
	errorMessage,
	orientation = "vertical",
	className,
	children,
	...props
}: RadioGroupProps) {
	return (
		<AriaRadioGroup
			{...props}
			orientation={orientation}
			className={composeRenderProps(className, (cls) => cn("group flex flex-col gap-2", cls))}
		>
			{label ? <Label>{label}</Label> : null}
			<div
				className={cn(
					"flex gap-2",
					orientation === "vertical" ? "flex-col" : "flex-row flex-wrap gap-x-5",
				)}
			>
				{children}
			</div>
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
		</AriaRadioGroup>
	);
}
