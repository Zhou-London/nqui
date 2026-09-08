import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import {
	Select as AriaSelect,
	type SelectProps as AriaSelectProps,
	Button,
	composeRenderProps,
	SelectValue,
} from "react-aria-components";
import { cn } from "../utils/cn";
import {
	Description,
	FieldError,
	type FieldProps,
	type InputBoxVariants,
	inputBoxStyles,
	Label,
} from "./field";
import { ListBox, ListBoxItem, type ListBoxItemProps, ListBoxSection } from "./listbox";
import { Popover } from "./popover";

export interface SelectProps<T extends object>
	extends Omit<AriaSelectProps<T>, "className" | "children">,
		FieldProps,
		InputBoxVariants {
	className?: string;
	items?: Iterable<T>;
	children: ReactNode | ((item: T) => ReactNode);
	startContent?: ReactNode;
	/** Custom rendering of the selected item in the trigger; defaults to its text value. */
	renderValue?: (item: T) => ReactNode;
}

/** Single-value picker with a popover list. */
export function Select<T extends object>({
	label,
	description,
	errorMessage,
	size,
	variant,
	radius,
	className,
	items,
	children,
	startContent,
	renderValue,
	...props
}: SelectProps<T>) {
	return (
		<AriaSelect
			{...props}
			className={composeRenderProps(className, (cls) => cn("group flex flex-col gap-1.5", cls))}
		>
			{label ? <Label>{label}</Label> : null}
			<Button
				className={(rp) =>
					inputBoxStyles({
						size,
						variant,
						radius,
						className: cn(
							"cursor-default text-left",
							rp.isFocusVisible && "border-primary ring-2 ring-primary/25",
						),
					})
				}
			>
				{startContent}
				<SelectValue<T> className="flex min-w-0 flex-1 items-center gap-2 truncate data-placeholder:text-subtle">
					{({ isPlaceholder, selectedItem, selectedText, defaultChildren }) =>
						isPlaceholder
							? defaultChildren
							: renderValue && selectedItem
								? renderValue(selectedItem)
								: (selectedText ?? defaultChildren)
					}
				</SelectValue>
				<ChevronDown
					aria-hidden
					className="shrink-0 text-muted transition-transform group-open:rotate-180"
				/>
			</Button>
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
			<Popover className="min-w-(--trigger-width)">
				<ListBox items={items} className="max-h-72 overflow-auto">
					{children}
				</ListBox>
			</Popover>
		</AriaSelect>
	);
}

export function SelectItem<T extends object = object>(props: ListBoxItemProps<T>) {
	return <ListBoxItem {...props} />;
}

export { ListBoxSection as SelectSection };
