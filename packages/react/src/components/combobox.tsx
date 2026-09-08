import { ChevronsUpDown } from "lucide-react";
import type { ReactNode } from "react";
import {
	ComboBox as AriaComboBox,
	type ComboBoxProps as AriaComboBoxProps,
	Button,
	composeRenderProps,
	Input,
} from "react-aria-components";
import { cn } from "../utils/cn";
import {
	Description,
	FieldError,
	FieldGroup,
	type FieldProps,
	type InputBoxVariants,
	inputStyles,
	Label,
} from "./field";
import { ListBox, ListBoxItem, type ListBoxItemProps } from "./listbox";
import { Popover } from "./popover";

export interface ComboBoxProps<T extends object>
	extends Omit<AriaComboBoxProps<T>, "className" | "children">,
		FieldProps,
		InputBoxVariants {
	className?: string;
	placeholder?: string;
	items?: Iterable<T>;
	children: ReactNode | ((item: T) => ReactNode);
	startContent?: ReactNode;
}

/** Text input with filtered suggestions. */
export function ComboBox<T extends object>({
	label,
	description,
	errorMessage,
	size,
	variant,
	radius,
	className,
	placeholder,
	items,
	children,
	startContent,
	...props
}: ComboBoxProps<T>) {
	return (
		<AriaComboBox
			{...props}
			className={composeRenderProps(className, (cls) => cn("group flex flex-col gap-1.5", cls))}
		>
			{label ? <Label>{label}</Label> : null}
			<FieldGroup size={size} variant={variant} radius={radius} className="pr-1">
				{startContent}
				<Input placeholder={placeholder} className={inputStyles()} />
				<Button className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted outline-hidden hover:bg-surface-2 pressed:bg-surface-3">
					<ChevronsUpDown aria-hidden />
				</Button>
			</FieldGroup>
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
			<Popover className="min-w-(--trigger-width)">
				<ListBox items={items} className="max-h-72 overflow-auto">
					{children}
				</ListBox>
			</Popover>
		</AriaComboBox>
	);
}

export function ComboBoxItem<T extends object = object>(props: ListBoxItemProps<T>) {
	return <ListBoxItem {...props} />;
}
