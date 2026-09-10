import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DateValue } from "react-aria-components";
import {
	Calendar as AriaCalendar,
	type CalendarProps as AriaCalendarProps,
	RangeCalendar as AriaRangeCalendar,
	type RangeCalendarProps as AriaRangeCalendarProps,
	Button,
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeaderCell,
	composeRenderProps,
	Heading,
	Text,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/focus-ring";
import { tv } from "../utils/tv";

const navButton = tv({
	extend: focusRing,
	base: "flex size-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-40 [&_svg]:size-4",
});

const cellStyles = tv({
	extend: focusRing,
	base: [
		"flex size-8 cursor-default items-center justify-center rounded-full text-sm tabular-nums transition-colors",
		"hover:bg-surface-2 pressed:bg-surface-3",
		"outside-month:text-subtle outside-visible-range:opacity-0 disabled:text-subtle unavailable:line-through",
		"selected:bg-primary selected:text-primary-foreground selected:hover:bg-primary/90",
		"invalid:bg-danger invalid:text-danger-foreground",
	],
});

const rangeCellStyles = tv({
	extend: focusRing,
	base: [
		"flex size-8 cursor-default items-center justify-center text-sm tabular-nums transition-colors",
		"rounded-full hover:bg-surface-2",
		"outside-month:text-subtle outside-visible-range:opacity-0 disabled:text-subtle",
		"selected:rounded-none selected:bg-primary-soft selected:text-primary-text",
		"selection-start:rounded-l-full selection-start:bg-primary selection-start:text-primary-foreground",
		"selection-end:rounded-r-full selection-end:bg-primary selection-end:text-primary-foreground",
		"invalid:selected:bg-danger-soft invalid:selected:text-danger-text",
	],
});

function CalendarHeader() {
	return (
		<header className="flex items-center justify-between px-1 pb-2">
			<Button slot="previous" className={navButton()}>
				<ChevronLeft aria-hidden />
			</Button>
			<Heading className="font-semibold text-sm" />
			<Button slot="next" className={navButton()}>
				<ChevronRight aria-hidden />
			</Button>
		</header>
	);
}

function GridHeader() {
	return (
		<CalendarGridHeader>
			{(day) => (
				<CalendarHeaderCell className="size-8 font-medium text-muted text-xs">
					{day}
				</CalendarHeaderCell>
			)}
		</CalendarGridHeader>
	);
}

export interface CalendarProps<T extends DateValue>
	extends Omit<AriaCalendarProps<T>, "className"> {
	className?: string;
	errorMessage?: string;
}

/** Month grid for picking a single date. */
export function Calendar<T extends DateValue>({
	className,
	errorMessage,
	...props
}: CalendarProps<T>) {
	return (
		<AriaCalendar
			{...props}
			className={composeRenderProps(className, (cls) => cn("w-fit text-foreground", cls))}
		>
			<CalendarHeader />
			<CalendarGrid className="border-separate border-spacing-0.5">
				<GridHeader />
				<CalendarGridBody>
					{(date) => <CalendarCell date={date} className={cellStyles()} />}
				</CalendarGridBody>
			</CalendarGrid>
			{errorMessage ? (
				<Text slot="errorMessage" className="mt-2 block text-danger-text text-xs">
					{errorMessage}
				</Text>
			) : null}
		</AriaCalendar>
	);
}

export interface RangeCalendarProps<T extends DateValue>
	extends Omit<AriaRangeCalendarProps<T>, "className"> {
	className?: string;
	errorMessage?: string;
}

/** Month grid for picking a start and end date. */
export function RangeCalendar<T extends DateValue>({
	className,
	errorMessage,
	...props
}: RangeCalendarProps<T>) {
	return (
		<AriaRangeCalendar
			{...props}
			className={composeRenderProps(className, (cls) => cn("w-fit text-foreground", cls))}
		>
			<CalendarHeader />
			<CalendarGrid className="border-separate border-spacing-y-0.5">
				<GridHeader />
				<CalendarGridBody>
					{(date) => <CalendarCell date={date} className={rangeCellStyles()} />}
				</CalendarGridBody>
			</CalendarGrid>
			{errorMessage ? (
				<Text slot="errorMessage" className="mt-2 block text-danger-text text-xs">
					{errorMessage}
				</Text>
			) : null}
		</AriaRangeCalendar>
	);
}
