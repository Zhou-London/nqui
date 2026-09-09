import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";
import {
	Checkbox as AriaCheckbox,
	CheckboxGroup as AriaCheckboxGroup,
	type CheckboxGroupProps as AriaCheckboxGroupProps,
	type CheckboxProps as AriaCheckboxProps,
	composeRenderProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRingGroup } from "../utils/focus-ring";
import { tv, type VariantProps } from "../utils/tv";
import { Description, FieldError, type FieldProps, Label, optionListStyles } from "./field";

const boxStyles = tv({
	extend: focusRingGroup,
	base: [
		"flex shrink-0 items-center justify-center rounded-[0.3rem] border border-border-strong bg-surface text-transparent shadow-2xs",
		"transition-[background-color,border-color,color,box-shadow] duration-150",
		"group-hover:border-subtle group-pressed:scale-95",
		"group-selected:border-transparent group-indeterminate:border-transparent",
		"group-invalid:border-danger group-disabled:opacity-50",
		"[&_svg]:size-[0.8em] [&_svg]:stroke-[3.5]",
	],
	variants: {
		color: {
			accent:
				"group-selected:bg-accent group-selected:text-accent-foreground group-indeterminate:bg-accent group-indeterminate:text-accent-foreground",
			primary:
				"group-selected:bg-primary group-selected:text-primary-foreground group-indeterminate:bg-primary group-indeterminate:text-primary-foreground",
		},
		size: {
			sm: "size-4 text-sm",
			md: "size-[1.125rem] text-base",
			lg: "size-5 text-lg",
		},
	},
	defaultVariants: { color: "primary", size: "md" },
});

export interface CheckboxProps
	extends Omit<AriaCheckboxProps, "className" | "children">,
		VariantProps<typeof boxStyles> {
	className?: AriaCheckboxProps["className"];
	children?: ReactNode;
	description?: ReactNode;
}

export function Checkbox({
	color,
	size,
	className,
	children,
	description,
	...props
}: CheckboxProps) {
	return (
		<AriaCheckbox
			{...props}
			className={composeRenderProps(className, (cls) =>
				cn(
					"group flex cursor-default items-start gap-2.5 text-foreground text-sm disabled:opacity-60",
					cls,
				),
			)}
		>
			{({ isSelected, isIndeterminate }) => (
				<>
					<span className={boxStyles({ color, size, className: description ? "mt-0.5" : "" })}>
						{isIndeterminate ? <Minus aria-hidden /> : isSelected ? <Check aria-hidden /> : null}
					</span>
					{children || description ? (
						<span className="flex flex-col gap-0.5">
							<span>{children}</span>
							{description ? <span className="text-muted text-xs">{description}</span> : null}
						</span>
					) : null}
				</>
			)}
		</AriaCheckbox>
	);
}

export interface CheckboxGroupProps
	extends Omit<AriaCheckboxGroupProps, "className" | "children">,
		FieldProps {
	className?: AriaCheckboxGroupProps["className"];
	children: ReactNode;
	orientation?: "vertical" | "horizontal";
}

export function CheckboxGroup({
	label,
	description,
	errorMessage,
	orientation = "vertical",
	className,
	children,
	...props
}: CheckboxGroupProps) {
	return (
		<AriaCheckboxGroup
			{...props}
			data-orientation={orientation}
			className={composeRenderProps(className, (cls) => cn("group flex flex-col gap-2", cls))}
		>
			{label ? <Label>{label}</Label> : null}
			<div className={optionListStyles({ orientation })}>{children}</div>
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
		</AriaCheckboxGroup>
	);
}
