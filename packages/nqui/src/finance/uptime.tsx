import type { ComponentProps, ReactNode } from "react";
import { Chip, type ChipProps } from "../components/chip";
import { cn } from "../utils/cn";
import { formatDuration } from "../utils/format";

export type UptimeStatus = "up" | "degraded" | "down" | "none";

export interface UptimePeriod {
	status: UptimeStatus;
	/** Tooltip label such as a date. */
	label?: string;
}

export interface UptimeBarProps extends Omit<ComponentProps<"div">, "children"> {
	periods: UptimePeriod[];
	/** Text on the left, e.g. "90 days ago". */
	startLabel?: ReactNode;
	endLabel?: ReactNode;
	/** Overall availability shown on the right, as a ratio. */
	availability?: number;
	height?: number;
}

const statusColor: Record<UptimeStatus, string> = {
	up: "bg-success",
	degraded: "bg-warning",
	down: "bg-danger",
	none: "bg-surface-3",
};

/** Status-page style strip of daily bars. */
export function UptimeBar({
	periods,
	startLabel,
	endLabel,
	availability,
	height = 28,
	className,
	...props
}: UptimeBarProps) {
	return (
		<div {...props} className={cn("flex flex-col gap-1.5", className)}>
			<div className="flex items-end gap-px" style={{ height }}>
				{periods.map((p, i) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: periods are positional
						key={i}
						title={p.label ? `${p.label}: ${p.status}` : p.status}
						className={cn(
							"h-full min-w-0.5 flex-1 rounded-[2px] transition-opacity hover:opacity-70",
							statusColor[p.status],
						)}
					/>
				))}
			</div>
			{startLabel || endLabel || availability !== undefined ? (
				<div className="flex items-center justify-between text-muted text-xs">
					<span>{startLabel}</span>
					{availability !== undefined ? (
						<span className="numeric font-medium text-foreground">
							{(availability * 100).toFixed(2)}% uptime
						</span>
					) : null}
					<span>{endLabel}</span>
				</div>
			) : null}
		</div>
	);
}

export interface LatencyBadgeProps extends Omit<ChipProps, "color" | "children"> {
	/** Milliseconds. */
	value: number;
	/** Milliseconds at which the badge turns amber and then red. */
	thresholds?: [warning: number, danger: number];
	prefix?: string;
}

/** Latency reading colored by SLO thresholds. */
export function LatencyBadge({
	value,
	thresholds = [200, 800],
	prefix,
	...props
}: LatencyBadgeProps) {
	const color = value >= thresholds[1] ? "danger" : value >= thresholds[0] ? "warning" : "success";
	return (
		<Chip variant="dot" color={color} className="numeric" {...props}>
			{prefix}
			{formatDuration(value)}
		</Chip>
	);
}
