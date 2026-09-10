import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export interface TooltipPayloadItem {
	name?: string | number;
	value?: number | string | ReadonlyArray<number | string>;
	color?: string;
	dataKey?: string | number;
	payload?: Record<string, unknown>;
}

export interface ChartTooltipProps {
	active?: boolean;
	label?: ReactNode;
	payload?: ReadonlyArray<TooltipPayloadItem>;
	formatter?: (
		value: number | string,
		name: string | number,
		item: TooltipPayloadItem,
	) => ReactNode;
	labelFormatter?: (label: ReactNode) => ReactNode;
	/**
	 * Swatch color per `dataKey`. Recharts reports a bar's `fill` as its color, which is a
	 * `url(#gradient)` reference for NQUI bars, so the charts pass their series colors here.
	 */
	colors?: Record<string, string>;
	className?: string;
}

function swatchColor(
	item: TooltipPayloadItem,
	colors?: Record<string, string>,
): string | undefined {
	const fromSeries = item.dataKey === undefined ? undefined : colors?.[String(item.dataKey)];
	if (fromSeries) return fromSeries;
	return item.color?.startsWith("url(") ? undefined : item.color;
}

/** Card-style tooltip content for Recharts `Tooltip content`. */
export function ChartTooltip({
	active,
	label,
	payload,
	formatter,
	labelFormatter,
	colors,
	className,
}: ChartTooltipProps) {
	if (!active || !payload || payload.length === 0) return null;
	return (
		<div
			className={cn(
				"min-w-32 rounded-lg border border-border bg-surface px-4 py-2 text-xs shadow-lg",
				className,
			)}
		>
			{label !== undefined ? (
				<div className="mb-1 font-medium text-muted">
					{labelFormatter ? labelFormatter(label) : label}
				</div>
			) : null}
			<div className="flex flex-col gap-1">
				{payload.map((item, i) => (
					<div key={String(item.dataKey ?? i)} className="flex items-center justify-between gap-4">
						<span className="flex items-center gap-2 text-muted">
							<span
								className="size-2 rounded-full"
								style={{ background: swatchColor(item, colors) }}
							/>
							{item.name}
						</span>
						<span className="numeric font-medium text-foreground">
							{formatter && item.value !== undefined && !Array.isArray(item.value)
								? formatter(item.value as number | string, item.name ?? "", item)
								: Array.isArray(item.value)
									? item.value.join(" – ")
									: typeof item.value === "number"
										? item.value.toLocaleString()
										: item.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

export interface LegendItem {
	name: string;
	color: string;
}

export interface ChartLegendProps {
	items: LegendItem[];
	className?: string;
	align?: "start" | "center" | "end";
}

/** Dots-and-labels legend rendered in normal document flow (put it in a card header). */
export function ChartLegend({ items, className, align = "end" }: ChartLegendProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center gap-x-4 gap-y-1 text-muted text-xs",
				align === "center" && "justify-center",
				align === "end" && "justify-end",
				className,
			)}
		>
			{items.map((it) => (
				<span key={it.name} className="flex items-center gap-2">
					<span className="size-2 rounded-full" style={{ background: it.color }} />
					{it.name}
				</span>
			))}
		</div>
	);
}

export const axisTick = { fill: "var(--nq-muted)", fontSize: 12 } as const;
export const axisProps = {
	axisLine: false,
	tickLine: false,
	tick: axisTick,
	tickMargin: 8,
} as const;
