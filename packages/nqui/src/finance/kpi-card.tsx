import type { ReactNode } from "react";
import { Card, type CardProps } from "../components/card";
import { Skeleton } from "../components/skeleton";
import { cn } from "../utils/cn";
import { DeltaChip, type DeltaChipProps } from "./price";
import { Sparkline, type SparklineProps } from "./sparkline";

export interface KpiCardProps extends Omit<CardProps, "title"> {
	label: ReactNode;
	value: ReactNode;
	/** Change ratio rendered as a `DeltaChip`. */
	delta?: number;
	deltaProps?: Partial<DeltaChipProps>;
	/** Text after the delta, e.g. "vs last week". */
	caption?: ReactNode;
	icon?: ReactNode;
	/** Series drawn as a sparkline along the bottom. */
	trend?: number[];
	trendProps?: Partial<SparklineProps>;
	/** Extra content on the right of the header (menus, links). */
	action?: ReactNode;
	isLoading?: boolean;
	size?: "sm" | "md" | "lg";
}

/** Metric card: label, big number, delta pill, optional sparkline footer. */
export function KpiCard({
	label,
	value,
	delta,
	deltaProps,
	caption,
	icon,
	trend,
	trendProps,
	action,
	isLoading,
	size = "md",
	className,
	...props
}: KpiCardProps) {
	const valueClass = size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-[1.75rem]";
	return (
		<Card {...props} className={cn("relative", className)}>
			<div
				className={cn("flex flex-col gap-3", size === "sm" ? "p-4" : "p-5", trend ? "pb-0" : "")}
			>
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-center gap-2 text-muted text-sm">
						{icon ? (
							<span className="flex size-7 items-center justify-center rounded-lg bg-surface-2 text-muted [&_svg]:size-4">
								{icon}
							</span>
						) : null}
						<span>{label}</span>
					</div>
					{action}
				</div>
				<div className="flex flex-wrap items-center gap-3">
					{isLoading ? (
						<Skeleton className="h-8 w-32" />
					) : (
						<span
							className={cn("numeric font-semibold text-foreground tracking-tight", valueClass)}
						>
							{value}
						</span>
					)}
					{delta !== undefined && !isLoading ? <DeltaChip value={delta} {...deltaProps} /> : null}
					{caption ? <span className="text-muted text-xs">{caption}</span> : null}
				</div>
			</div>
			{trend ? (
				<div className="-mb-px mt-2 px-0">
					<Sparkline
						data={trend}
						height={44}
						color={delta === undefined ? "primary" : delta >= 0 ? "up" : "down"}
						{...trendProps}
					/>
				</div>
			) : null}
		</Card>
	);
}

export interface StatProps {
	label: ReactNode;
	value: ReactNode;
	delta?: number;
	deltaProps?: Partial<DeltaChipProps>;
	className?: string;
	align?: "start" | "center" | "end";
}

/** Compact inline metric (value, delta, label) for stat rows inside cards. */
export function Stat({ label, value, delta, deltaProps, className, align = "start" }: StatProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-0.5",
				align === "center" && "items-center",
				align === "end" && "items-end",
				className,
			)}
		>
			<div className="flex items-center gap-2">
				<span className="numeric font-semibold text-foreground text-xl tracking-tight">
					{value}
				</span>
				{delta !== undefined ? <DeltaChip value={delta} variant="text" {...deltaProps} /> : null}
			</div>
			<span className="text-muted text-xs">{label}</span>
		</div>
	);
}
