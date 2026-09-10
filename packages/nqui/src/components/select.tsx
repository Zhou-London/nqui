import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import {
	Select as AriaSelect,
	type SelectProps as AriaSelectProps,
	Button,
	composeRenderProps,
	SelectValue,
} from "react-aria-components";
import { useDensity } from "../hooks/use-density";
import { cn } from "../utils/cn";
import {
	Description,
	FieldError,
	type FieldProps,
	type InputBoxVariants,
	inputBoxStyles,
	Label,
} from "./field";
import { ListBox, ListBoxItem, ListBoxSection } from "./listbox";
import { Popover } from "./popover";

export interface SelectProps<T extends object>
	extends Omit<AriaSelectProps<T>, "className" | "children">,
		FieldProps,
		InputBoxVariants {
	className?: AriaSelectProps<T>["className"];
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
	const compact = useDensity() === "compact";
	return (
		<AriaSelect
			{...props}
			className={composeRenderProps(className, (cls) => cn("group flex flex-col gap-2", cls))}
		>
			{label ? <Label>{label}</Label> : null}
			<Button
				className={inputBoxStyles({
					size: size ?? (compact ? "sm" : "md"),
					variant,
					radius: radius ?? (compact ? "md" : "lg"),
					className: cn(
						"cursor-default text-left",
						// The trigger button never gets data-invalid or data-focus-within; read those from the Select root.
						"focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:hover:border-primary",
						"group-invalid:border-danger group-invalid:focus-visible:ring-danger/25",
					),
				})}
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

export { ListBoxItem as SelectItem, ListBoxSection as SelectSection };
