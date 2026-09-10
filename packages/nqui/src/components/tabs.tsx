import {
	Tab as AriaTab,
	TabList as AriaTabList,
	type TabListProps as AriaTabListProps,
	TabPanel as AriaTabPanel,
	type TabPanelProps as AriaTabPanelProps,
	type TabProps as AriaTabProps,
	Tabs as AriaTabs,
	type TabsProps as AriaTabsProps,
	composeRenderProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/focus-ring";

export type TabsVariant = "underline" | "segmented" | "soft" | "text";
export type TabsSize = "sm" | "md" | "lg";

export interface TabsProps extends Omit<AriaTabsProps, "className"> {
	className?: string;
	/**
	 * `underline` for page sections, `segmented` for the pill switcher in dashboard headers,
	 * `soft` for filter chips, `text` for compact range pickers such as 1H 1D 1W.
	 */
	variant?: TabsVariant;
	size?: TabsSize;
}

/** The variant and size travel to `TabList` and `Tab` through data attributes on the root. */
export function Tabs({ variant = "underline", size = "md", className, ...props }: TabsProps) {
	return (
		<AriaTabs
			{...props}
			data-variant={variant}
			data-size={size}
			className={composeRenderProps(className, (cls) =>
				cn("group/tabs flex flex-col gap-4 orientation-vertical:flex-row", cls),
			)}
		/>
	);
}

export interface TabListProps<T extends object> extends Omit<AriaTabListProps<T>, "className"> {
	className?: string;
}

export function TabList<T extends object>({ className, ...props }: TabListProps<T>) {
	return (
		<AriaTabList
			{...props}
			className={composeRenderProps(className, (cls) =>
				cn(
					"flex shrink-0 orientation-vertical:flex-col max-sm:max-w-full max-sm:overflow-x-auto max-sm:no-scrollbar",
					"group-data-[variant=underline]/tabs:gap-6 group-data-[variant=underline]/tabs:border-border group-data-[variant=underline]/tabs:border-b group-data-[variant=underline]/tabs:orientation-vertical:border-r group-data-[variant=underline]/tabs:orientation-vertical:border-b-0",
					"group-data-[variant=segmented]/tabs:w-fit group-data-[variant=segmented]/tabs:gap-1 group-data-[variant=segmented]/tabs:rounded-full group-data-[variant=segmented]/tabs:bg-surface-2 group-data-[variant=segmented]/tabs:p-1",
					"group-data-[variant=soft]/tabs:gap-1",
					"group-data-[variant=text]/tabs:gap-1",
					cls,
				),
			)}
		/>
	);
}

export interface TabProps extends Omit<AriaTabProps, "className"> {
	className?: string;
}

export function Tab({ className, ...props }: TabProps) {
	return (
		<AriaTab
			{...props}
			className={composeRenderProps(className, (cls) =>
				cn(
					focusRing(),
					"relative touch-target flex cursor-default select-none items-center gap-2 whitespace-nowrap font-medium transition-colors disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
					"group-data-[size=sm]/tabs:text-xs group-data-[size=md]/tabs:text-sm group-data-[size=lg]/tabs:text-sm",
					"group-data-[size=sm]/tabs:h-6 group-data-[size=md]/tabs:h-8 group-data-[size=lg]/tabs:h-10",
					// underline
					"group-data-[variant=underline]/tabs:-mb-px group-data-[variant=underline]/tabs:h-auto group-data-[variant=underline]/tabs:border-transparent group-data-[variant=underline]/tabs:border-b-2 group-data-[variant=underline]/tabs:px-1 group-data-[variant=underline]/tabs:pb-2 group-data-[variant=underline]/tabs:text-muted group-data-[variant=underline]/tabs:hover:text-foreground group-data-[variant=underline]/tabs:selected:border-foreground group-data-[variant=underline]/tabs:selected:text-foreground",
					"group-data-[variant=underline]/tabs:orientation-vertical:-mr-px group-data-[variant=underline]/tabs:orientation-vertical:border-r-2 group-data-[variant=underline]/tabs:orientation-vertical:border-b-0 group-data-[variant=underline]/tabs:orientation-vertical:pr-4 group-data-[variant=underline]/tabs:orientation-vertical:pb-0",
					// segmented
					"group-data-[variant=segmented]/tabs:rounded-full group-data-[variant=segmented]/tabs:px-4 group-data-[variant=segmented]/tabs:text-muted group-data-[variant=segmented]/tabs:hover:text-foreground group-data-[variant=segmented]/tabs:selected:bg-surface group-data-[variant=segmented]/tabs:selected:text-foreground group-data-[variant=segmented]/tabs:selected:shadow-sm",
					// soft
					"group-data-[variant=soft]/tabs:rounded-full group-data-[variant=soft]/tabs:px-4 group-data-[variant=soft]/tabs:text-muted group-data-[variant=soft]/tabs:hover:bg-surface-2 group-data-[variant=soft]/tabs:hover:text-foreground group-data-[variant=soft]/tabs:selected:bg-accent-soft group-data-[variant=soft]/tabs:selected:text-foreground",
					// text
					"group-data-[variant=text]/tabs:rounded-md group-data-[variant=text]/tabs:px-2 group-data-[variant=text]/tabs:text-muted group-data-[variant=text]/tabs:hover:text-foreground group-data-[variant=text]/tabs:selected:bg-primary-soft group-data-[variant=text]/tabs:selected:text-primary-text",
					cls,
				),
			)}
		/>
	);
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, "className"> {
	className?: string;
}

export function TabPanel({ className, ...props }: TabPanelProps) {
	return (
		<AriaTabPanel
			{...props}
			className={composeRenderProps(className, (cls) => cn("flex-1 outline-hidden", cls))}
		/>
	);
}
