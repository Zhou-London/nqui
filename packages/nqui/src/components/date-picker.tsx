import { Calendar as CalendarIcon } from "lucide-react";
import {
	DateInput as AriaDateInput,
	type DateInputProps as AriaDateInputProps,
	DatePicker as AriaDatePicker,
	type DatePickerProps as AriaDatePickerProps,
	DateRangePicker as AriaDateRangePicker,
	type DateRangePickerProps as AriaDateRangePickerProps,
	Button,
	composeRenderProps,
	DateSegment,
	type DateValue,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { Calendar, RangeCalendar } from "./calendar";
import { Dialog } from "./dialog";
import {
	Description,
	FieldError,
	FieldGroup,
	type FieldProps,
	type InputBoxVariants,
	Label,
} from "./field";
import { Popover } from "./popover";

const segmentClass = cn(
	"rounded-xs px-1 tabular-nums caret-transparent outline-hidden",
	"type-literal:px-0 placeholder-shown:text-subtle",
	"focus:bg-primary focus:text-primary-foreground",
	"invalid:text-error-text",
);

export function DateInput({
	className,
	...props
}: Omit<AriaDateInputProps, "children"> & { className?: string }) {
	return (
		<AriaDateInput {...props} className={cn("flex flex-1 items-center", className)}>
			{(segment) => <DateSegment segment={segment} className={segmentClass} />}
		</AriaDateInput>
	);
}

const trigger =
	"flex size-6 shrink-0 items-center justify-center rounded-md text-muted outline-hidden hover:bg-surface-2 hover:text-foreground pressed:bg-surface-3 max-lg:h-full max-lg:w-11 [&_svg]:size-4";

export interface DatePickerProps<T extends DateValue>
	extends Omit<AriaDatePickerProps<T>, "className">,
		FieldProps,
		InputBoxVariants {
	className?: string;
}

/** Segmented date input with a calendar popover. Values are `@internationalized/date` objects. */
export function DatePicker<T extends DateValue>({
	label,
	description,
	errorMessage,
	size,
	variant,
	radius,
	className,
	...props
}: DatePickerProps<T>) {
	return (
		<AriaDatePicker
			{...props}
			className={composeRenderProps(className, (cls) => cn("group flex flex-col gap-2", cls))}
		>
			{label ? <Label>{label}</Label> : null}
			<FieldGroup size={size} variant={variant} radius={radius} className="pr-1">
				<DateInput />
				<Button className={trigger}>
					<CalendarIcon aria-hidden />
				</Button>
			</FieldGroup>
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
			<Popover>
				<Dialog className="p-4">
					<Calendar />
				</Dialog>
			</Popover>
		</AriaDatePicker>
	);
}

export interface DateRangePickerProps<T extends DateValue>
	extends Omit<AriaDateRangePickerProps<T>, "className">,
		FieldProps,
		InputBoxVariants {
	className?: string;
}

/** Start and end date inputs sharing one range calendar. */
export function DateRangePicker<T extends DateValue>({
	label,
	description,
	errorMessage,
	size,
	variant,
	radius,
	className,
	...props
}: DateRangePickerProps<T>) {
	return (
		<AriaDateRangePicker
			{...props}
			className={composeRenderProps(className, (cls) => cn("group flex flex-col gap-2", cls))}
		>
			{label ? <Label>{label}</Label> : null}
			<FieldGroup size={size} variant={variant} radius={radius} className="pr-1">
				<DateInput slot="start" className="flex-none" />
				<span aria-hidden className="px-1 text-subtle">
					–
				</span>
				<DateInput slot="end" />
				<Button className={trigger}>
					<CalendarIcon aria-hidden />
				</Button>
			</FieldGroup>
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
			<Popover>
				<Dialog className="p-4">
					<RangeCalendar />
				</Dialog>
			</Popover>
		</AriaDateRangePicker>
	);
}
