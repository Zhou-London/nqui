import {
	ToggleButton,
	ToggleButtonGroup,
	type ToggleButtonGroupProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/focus-ring";

export interface TimeRangeOption {
	id: string;
	label: string;
}

export const DEFAULT_TIME_RANGES: TimeRangeOption[] = [
	{ id: "1h", label: "1H" },
	{ id: "1d", label: "1D" },
	{ id: "1w", label: "1W" },
	{ id: "1m", label: "1M" },
	{ id: "1y", label: "1Y" },
	{ id: "all", label: "ALL" },
];

export interface TimeRangeSelectorProps
	extends Omit<
		ToggleButtonGroupProps,
		"selectionMode" | "selectedKeys" | "onSelectionChange" | "children" | "className"
	> {
	options?: TimeRangeOption[];
	value: string;
	onChange: (id: string) => void;
	className?: string;
	size?: "sm" | "md";
}

/** Compact 1H 1D 1W 1M 1Y ALL switcher for charts. */
export function TimeRangeSelector({
	options = DEFAULT_TIME_RANGES,
	value,
	onChange,
	className,
	size = "sm",
	...props
}: TimeRangeSelectorProps) {
	return (
		<ToggleButtonGroup
			{...props}
			selectionMode="single"
			disallowEmptySelection
			selectedKeys={[value]}
			onSelectionChange={(keys) => {
				const next = [...keys][0];
				if (next !== undefined) onChange(String(next));
			}}
			className={cn("inline-flex items-center gap-0.5", className)}
		>
			{options.map((o) => (
				<ToggleButton
					key={o.id}
					id={o.id}
					className={cn(
						focusRing(),
						"rounded-md px-2 font-medium text-muted transition-colors hover:text-foreground selected:bg-primary-soft selected:text-primary-text",
						size === "sm" ? "h-6 text-xs" : "h-7 text-sm",
					)}
				>
					{o.label}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
