import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import {
	NumberField as AriaNumberField,
	type NumberFieldProps as AriaNumberFieldProps,
	SearchField as AriaSearchField,
	type SearchFieldProps as AriaSearchFieldProps,
	TextArea as AriaTextArea,
	TextField as AriaTextField,
	type TextFieldProps as AriaTextFieldProps,
	Button,
	composeRenderProps,
	Input,
} from "react-aria-components";
import { useDensity } from "../hooks/use-density";
import { cn } from "../utils/cn";
import {
	Description,
	FieldError,
	FieldGroup,
	type FieldProps,
	type InputBoxVariants,
	inputBoxStyles,
	inputStyles,
	Label,
} from "./field";

export interface TextFieldProps
	extends Omit<AriaTextFieldProps, "className">,
		FieldProps,
		InputBoxVariants {
	className?: AriaTextFieldProps["className"];
	placeholder?: string;
	startContent?: ReactNode;
	endContent?: ReactNode;
}

/** Single-line text input with label, description, and validation message. */
export function TextField({
	label,
	description,
	errorMessage,
	placeholder,
	startContent,
	endContent,
	size,
	variant,
	radius,
	className,
	...props
}: TextFieldProps) {
	return (
		<AriaTextField
			{...props}
			className={composeRenderProps(className, (cls) => cn("group flex flex-col gap-2", cls))}
		>
			{label ? <Label>{label}</Label> : null}
			<FieldGroup size={size} variant={variant} radius={radius}>
				{startContent ? <span className="shrink-0 text-muted">{startContent}</span> : null}
				<Input placeholder={placeholder} className={inputStyles()} />
				{endContent ? <span className="shrink-0 text-muted">{endContent}</span> : null}
			</FieldGroup>
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
		</AriaTextField>
	);
}

export interface TextAreaProps
	extends Omit<AriaTextFieldProps, "className">,
		FieldProps,
		Omit<InputBoxVariants, "size"> {
	className?: AriaTextFieldProps["className"];
	placeholder?: string;
	rows?: number;
	/** Grow with content instead of scrolling. */
	autoResize?: boolean;
}

/** Multi-line text input. */
export function TextArea({
	label,
	description,
	errorMessage,
	placeholder,
	rows = 3,
	autoResize,
	variant,
	radius,
	className,
	...props
}: TextAreaProps) {
	const compact = useDensity() === "compact";
	return (
		<AriaTextField
			{...props}
			className={composeRenderProps(className, (cls) => cn("group flex flex-col gap-2", cls))}
		>
			{label ? <Label>{label}</Label> : null}
			<AriaTextArea
				placeholder={placeholder}
				rows={rows}
				className={inputBoxStyles({
					variant,
					radius: radius ?? (compact ? "md" : "lg"),
					focusSelf: true,
					className: cn(
						"h-auto resize-y py-2 text-sm outline-hidden placeholder:text-subtle",
						autoResize && "field-sizing-content resize-none",
					),
				})}
			/>
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
		</AriaTextField>
	);
}

export interface SearchFieldProps
	extends Omit<AriaSearchFieldProps, "className">,
		FieldProps,
		InputBoxVariants {
	className?: AriaSearchFieldProps["className"];
	placeholder?: string;
}

/** Search input with a leading icon and a clear button. Defaults to the filled pill look. */
export function SearchField({
	label,
	description,
	errorMessage,
	placeholder = "Search…",
	size,
	variant = "filled",
	radius,
	className,
	...props
}: SearchFieldProps) {
	const compact = useDensity() === "compact";
	return (
		<AriaSearchField
			{...props}
			className={composeRenderProps(className, (cls) => cn("group flex flex-col gap-2", cls))}
		>
			{label ? <Label>{label}</Label> : null}
			<FieldGroup size={size} variant={variant} radius={radius ?? (compact ? "md" : "full")}>
				<Search aria-hidden className="shrink-0 text-muted" />
				<Input
					placeholder={placeholder}
					className={inputStyles({ className: "[&::-webkit-search-cancel-button]:hidden" })}
				/>
				<Button className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted outline-hidden hover:bg-surface-3 hover:text-foreground group-empty:invisible">
					<X aria-hidden className="size-4!" />
				</Button>
			</FieldGroup>
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
		</AriaSearchField>
	);
}

export interface NumberFieldProps
	extends Omit<AriaNumberFieldProps, "className">,
		FieldProps,
		InputBoxVariants {
	className?: AriaNumberFieldProps["className"];
	placeholder?: string;
	startContent?: ReactNode;
	/** Hide the increment/decrement stepper. */
	hideStepper?: boolean;
}

/** Locale-aware numeric input with stepper buttons; `formatOptions` accepts Intl options. */
export function NumberField({
	label,
	description,
	errorMessage,
	placeholder,
	startContent,
	hideStepper,
	size,
	variant,
	radius,
	className,
	...props
}: NumberFieldProps) {
	return (
		<AriaNumberField
			{...props}
			className={composeRenderProps(className, (cls) => cn("group flex flex-col gap-2", cls))}
		>
			{label ? <Label>{label}</Label> : null}
			<FieldGroup
				size={size}
				variant={variant}
				radius={radius}
				className={hideStepper ? undefined : "pr-1"}
			>
				{startContent ? <span className="shrink-0 text-muted">{startContent}</span> : null}
				<Input placeholder={placeholder} className={inputStyles({ className: "numeric" })} />
				{hideStepper ? null : (
					<div className="flex shrink-0 flex-col">
						<Button
							slot="increment"
							className="flex h-4 w-6 items-center justify-center rounded-t-sm text-muted outline-hidden hover:bg-surface-2 hover:text-foreground"
						>
							<ChevronUp aria-hidden className="size-3!" />
						</Button>
						<Button
							slot="decrement"
							className="flex h-4 w-6 items-center justify-center rounded-b-sm text-muted outline-hidden hover:bg-surface-2 hover:text-foreground"
						>
							<ChevronDown aria-hidden className="size-3!" />
						</Button>
					</div>
				)}
			</FieldGroup>
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
		</AriaNumberField>
	);
}
