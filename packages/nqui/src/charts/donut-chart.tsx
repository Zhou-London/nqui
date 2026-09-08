import type { ReactNode } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { cn } from "../utils/cn";
import { ChartTooltip } from "./primitives";
import { seriesColor } from "./theme";

export interface DonutSlice {
	name: string;
	value: number;
	color?: string;
}

export interface DonutChartProps {
	data: DonutSlice[];
	size?: number;
	thickness?: number;
	/** Text in the middle; defaults to the formatted total. */
	centerLabel?: ReactNode;
	centerCaption?: ReactNode;
	valueFormatter?: (value: number) => string;
	/** Show a legend with values and shares beside the ring. */
	showLegend?: boolean;
	className?: string;
}

/** Ring chart with a total in the middle and an optional breakdown legend. */
export function DonutChart({
	data,
	size = 180,
	thickness = 18,
	centerLabel,
	centerCaption = "Total",
	valueFormatter = (v) => v.toLocaleString(),
	showLegend = true,
	className,
}: DonutChartProps) {
	const total = data.reduce((a, d) => a + d.value, 0);
	const outer = size / 2;
	return (
		<div className={cn("flex flex-wrap items-center gap-8", className)}>
			<div className="relative shrink-0" style={{ width: size, height: size }}>
				<PieChart responsive style={{ width: size, height: size }}>
					<Pie
						data={data}
						dataKey="value"
						nameKey="name"
						innerRadius={outer - thickness}
						outerRadius={outer}
						paddingAngle={2}
						cornerRadius={thickness / 2}
						stroke="none"
						isAnimationActive={false}
					>
						{data.map((d, i) => (
							<Cell key={d.name} fill={d.color ?? seriesColor(i)} />
						))}
					</Pie>
					<Tooltip content={<ChartTooltip formatter={(v) => valueFormatter(Number(v))} />} />
				</PieChart>
				<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
					<span className="numeric font-semibold text-foreground text-xl tracking-tight">
						{centerLabel ?? valueFormatter(total)}
					</span>
					{centerCaption ? <span className="text-muted text-xs">{centerCaption}</span> : null}
				</div>
			</div>
			{showLegend ? (
				<ul className="grid min-w-40 flex-1 grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
					{data.map((d, i) => (
						<li key={d.name} className="flex items-start gap-2 text-sm">
							<span
								className="mt-1.5 size-2 shrink-0 rounded-full"
								style={{ background: d.color ?? seriesColor(i) }}
							/>
							<span className="flex flex-col">
								<span className="font-medium text-foreground">{d.name}</span>
								<span className="numeric text-muted text-xs">
									{valueFormatter(d.value)} ({total ? ((d.value / total) * 100).toFixed(1) : 0}%)
								</span>
							</span>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}
