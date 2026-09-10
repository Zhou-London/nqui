import type { ReactNode } from "react";
import {
	Radio as AriaRadio,
	RadioGroup as AriaRadioGroup,
	type RadioGroupProps as AriaRadioGroupProps,
	type RadioProps as AriaRadioProps,
	composeRenderProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRingGroup } from "../utils/focus-ring";
import { tv, type VariantProps } from "../utils/tv";
import { Description, FieldError, type FieldProps, Label, optionListStyles } from "./field";

const dotStyles = tv({
	extend: focusRingGroup,
	base: [
		"flex shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface shadow-2xs",
		"transition-[border-color,border-width,box-shadow] duration-150",
		"group-hover:border-subtle group-pressed:scale-95",
		"group-invalid:border-error group-disabled:opacity-50",
	],
	variants: {
		color: {
			accent: "group-selected:border-accent group-selected:border-[5px]",
			primary: "group-selected:border-primary group-selected:border-[5px]",
		},
		size: {
			sm: "size-4",
			md: "size-5",
			lg: "size-6",
		},
	},
	defaultVariants: { color: "primary", size: "md" },
});

export interface RadioProps
	extends Omit<AriaRadioProps, "className" | "children">,
		VariantProps<typeof dotStyles> {
	className?: AriaRadioProps["className"];
	children?: ReactNode;
	description?: ReactNode;
}

export function Radio({ color, size, className, children, description, ...props }: RadioProps) {
	return (
		<AriaRadio
			{...props}
			className={composeRenderProps(className, (cls) =>
				cn(
					"group relative touch-target flex cursor-default items-start gap-2 text-foreground text-sm disabled:opacity-60",
					cls,
				),
			)}
		>
			<span className={dotStyles({ color, size })} />
			{children || description ? (
				<span className="flex flex-col gap-1">
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
	className?: AriaRadioGroupProps["className"];
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
			<div className={optionListStyles({ orientation })}>{children}</div>
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
		</AriaRadioGroup>
	);
}
