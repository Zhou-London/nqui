import {
	Meter as AriaMeter,
	type MeterProps as AriaMeterProps,
	ProgressBar as AriaProgressBar,
	type ProgressBarProps as AriaProgressBarProps,
	Label,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { tv, type VariantProps } from "../utils/tv";

const barStyles = tv({
	slots: {
		root: "flex w-full flex-col gap-2",
		header: "flex items-center justify-between text-sm",
		track: "relative w-full overflow-hidden rounded-full bg-surface-3",
		fill: "h-full rounded-full transition-[width] duration-300 ease-expo",
	},
	variants: {
		size: {
			sm: { track: "h-1" },
			md: { track: "h-1.5" },
			lg: { track: "h-2.5" },
		},
		color: {
			primary: { fill: "bg-primary" },
			accent: { fill: "bg-accent" },
			success: { fill: "bg-success" },
			warning: { fill: "bg-warning" },
			error: { fill: "bg-error" },
			info: { fill: "bg-info" },
		},
	},
	defaultVariants: { size: "md", color: "primary" },
});

export interface ProgressBarProps
	extends Omit<AriaProgressBarProps, "className">,
		VariantProps<typeof barStyles> {
	label?: string;
	showValue?: boolean;
	className?: string;
}

/** Determinate or indeterminate progress. */
export function ProgressBar({
	label,
	showValue = true,
	size,
	color,
	className,
	...props
}: ProgressBarProps) {
	const s = barStyles({ size, color });
	return (
		<AriaProgressBar {...props} className={s.root({ className })}>
			{({ percentage, valueText, isIndeterminate }) => (
				<>
					{label || showValue ? (
						<div className={s.header()}>
							{label ? <Label className="font-medium text-foreground">{label}</Label> : <span />}
							{showValue && !isIndeterminate ? (
								<span className="numeric text-muted">{valueText}</span>
							) : null}
						</div>
					) : null}
					<div className={s.track()}>
						{isIndeterminate ? (
							<div className={cn(s.fill(), "absolute inset-y-0 w-1/3 animate-indeterminate")} />
						) : (
							<div className={s.fill()} style={{ width: `${percentage ?? 0}%` }} />
						)}
					</div>
				</>
			)}
		</AriaProgressBar>
	);
}

export interface MeterProps
	extends Omit<AriaMeterProps, "className">,
		Omit<VariantProps<typeof barStyles>, "color"> {
	label?: string;
	showValue?: boolean;
	className?: string;
	/** Percentages at which the bar turns amber and then red. */
	thresholds?: [warning: number, error: number];
}

/** Capacity gauge (disk, memory, quota) that changes color as it fills. */
export function Meter({
	label,
	showValue = true,
	size,
	thresholds = [70, 90],
	className,
	...props
}: MeterProps) {
	return (
		<AriaMeter {...props} className={barStyles({ size }).root({ className })}>
			{({ percentage, valueText }) => {
				const pct = percentage ?? 0;
				const color = pct >= thresholds[1] ? "error" : pct >= thresholds[0] ? "warning" : "success";
				const s = barStyles({ size, color });
				return (
					<>
						{label || showValue ? (
							<div className={s.header()}>
								{label ? <Label className="font-medium text-foreground">{label}</Label> : <span />}
								{showValue ? <span className="numeric text-muted">{valueText}</span> : null}
							</div>
						) : null}
						<div className={s.track()}>
							<div className={s.fill()} style={{ width: `${pct}%` }} />
						</div>
					</>
				);
			}}
		</AriaMeter>
	);
}
