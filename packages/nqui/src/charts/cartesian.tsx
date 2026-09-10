import { type ReactNode, useId } from "react";
import {
	Area,
	Bar,
	CartesianGrid,
	Line,
	AreaChart as RAreaChart,
	BarChart as RBarChart,
	ReferenceLine,
	LineChart as RLineChart,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { axisProps, ChartTooltip, type ChartTooltipProps } from "./primitives";
import { seriesColor } from "./theme";

export type CurveType = "monotone" | "linear" | "step" | "stepAfter" | "natural";

export interface ChartSeries {
	/** Field in each data row. */
	key: string;
	name?: string;
	/** Any CSS color; defaults to the palette by index. */
	color?: string;
	dashed?: boolean;
	/** Draw on the second Y axis. */
	yAxis?: "left" | "right";
	/** Stack id for stacked areas and bars. */
	stackId?: string;
}

export interface CartesianChartProps {
	data: Record<string, unknown>[];
	/** Field used for the X axis. */
	xKey: string;
	series: ChartSeries[];
	height?: number;
	className?: string;
	showGrid?: boolean;
	showXAxis?: boolean;
	showYAxis?: boolean;
	showTooltip?: boolean;
	xFormatter?: (value: unknown) => string;
	yFormatter?: (value: number) => string;
	tooltipFormatter?: ChartTooltipProps["formatter"];
	yDomain?: [number | "auto" | "dataMin" | "dataMax", number | "auto" | "dataMin" | "dataMax"];
	/** Horizontal reference line, e.g. a target or previous close. */
	referenceY?: number;
	referenceLabel?: string;
	/** Chart children appended inside, for custom Recharts elements. */
	children?: ReactNode;
}

/** A per-instance id fragment safe inside `url(#…)` (React ids carry punctuation). */
function useGradientId(prefix: string): string {
	return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/** Resolved color per series key, for the tooltip swatches. */
function seriesColors(series: ChartSeries[]): Record<string, string> {
	const out: Record<string, string> = {};
	series.forEach((s, i) => {
		out[s.key] = s.color ?? seriesColor(i);
	});
	return out;
}

function Axes({
	xKey,
	showXAxis,
	showYAxis,
	xFormatter,
	yFormatter,
	yDomain,
	hasRight,
}: Pick<
	CartesianChartProps,
	"xKey" | "showXAxis" | "showYAxis" | "xFormatter" | "yFormatter" | "yDomain"
> & { hasRight: boolean }) {
	return (
		<>
			<XAxis
				dataKey={xKey}
				{...axisProps}
				tickFormatter={xFormatter}
				hide={!showXAxis}
				minTickGap={24}
				interval="preserveStartEnd"
			/>
			<YAxis
				yAxisId="left"
				{...axisProps}
				width="auto"
				tickFormatter={yFormatter}
				hide={!showYAxis}
				domain={yDomain}
			/>
			{hasRight ? (
				<YAxis
					yAxisId="right"
					orientation="right"
					{...axisProps}
					width="auto"
					tickFormatter={yFormatter}
				/>
			) : null}
		</>
	);
}

/** Multi-series line chart on the NQUI palette. */
export function LineChart({
	data,
	xKey,
	series,
	height = 240,
	className,
	showGrid = true,
	showXAxis = true,
	showYAxis = true,
	showTooltip = true,
	xFormatter,
	yFormatter,
	tooltipFormatter,
	yDomain = ["auto", "auto"],
	referenceY,
	referenceLabel,
	children,
	curve = "monotone",
	strokeWidth = 2,
	showDots = false,
}: CartesianChartProps & { curve?: CurveType; strokeWidth?: number; showDots?: boolean }) {
	const hasRight = series.some((s) => s.yAxis === "right");
	const colors = seriesColors(series);
	return (
		<RLineChart
			data={data}
			responsive
			style={{ width: "100%", height }}
			className={className}
			margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
		>
			{showGrid ? <CartesianGrid vertical={false} stroke="var(--nq-chart-grid)" /> : null}
			<Axes
				xKey={xKey}
				showXAxis={showXAxis}
				showYAxis={showYAxis}
				xFormatter={xFormatter}
				yFormatter={yFormatter}
				yDomain={yDomain}
				hasRight={hasRight}
			/>
			{showTooltip ? (
				<Tooltip
					cursor={{ stroke: "var(--nq-border-strong)", strokeDasharray: "3 3" }}
					content={<ChartTooltip formatter={tooltipFormatter} colors={colors} />}
				/>
			) : null}
			{referenceY !== undefined ? (
				<ReferenceLine
					yAxisId="left"
					y={referenceY}
					stroke="var(--nq-subtle)"
					strokeDasharray="4 4"
					label={
						referenceLabel
							? {
									value: referenceLabel,
									fill: "var(--nq-muted)",
									fontSize: 12,
									position: "insideTopRight",
								}
							: undefined
					}
				/>
			) : null}
			{series.map((s, i) => (
				<Line
					key={s.key}
					yAxisId={s.yAxis ?? "left"}
					type={curve}
					dataKey={s.key}
					name={s.name ?? s.key}
					stroke={s.color ?? seriesColor(i)}
					strokeWidth={strokeWidth}
					strokeDasharray={s.dashed ? "5 4" : undefined}
					dot={showDots ? { r: 3, strokeWidth: 0 } : false}
					activeDot={{ r: 4, strokeWidth: 0 }}
					isAnimationActive={false}
				/>
			))}
			{children}
		</RLineChart>
	);
}

/** Line chart with soft gradient fills under each series. */
export function AreaChart({
	data,
	xKey,
	series,
	height = 240,
	className,
	showGrid = true,
	showXAxis = true,
	showYAxis = true,
	showTooltip = true,
	xFormatter,
	yFormatter,
	tooltipFormatter,
	yDomain = ["auto", "auto"],
	referenceY,
	referenceLabel,
	children,
	curve = "monotone",
}: CartesianChartProps & { curve?: CurveType }) {
	const hasRight = series.some((s) => s.yAxis === "right");
	const colors = seriesColors(series);
	// Gradient ids are per instance so several charts on one page never share a `<defs>` entry.
	const gradientId = useGradientId("nq-area");
	return (
		<RAreaChart
			data={data}
			responsive
			style={{ width: "100%", height }}
			className={className}
			margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
		>
			<defs>
				{series.map((s, i) => {
					const color = s.color ?? seriesColor(i);
					return (
						<linearGradient key={s.key} id={`${gradientId}-${i}`} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={color} stopOpacity={0.28} />
							<stop offset="100%" stopColor={color} stopOpacity={0.02} />
						</linearGradient>
					);
				})}
			</defs>
			{showGrid ? <CartesianGrid vertical={false} stroke="var(--nq-chart-grid)" /> : null}
			<Axes
				xKey={xKey}
				showXAxis={showXAxis}
				showYAxis={showYAxis}
				xFormatter={xFormatter}
				yFormatter={yFormatter}
				yDomain={yDomain}
				hasRight={hasRight}
			/>
			{showTooltip ? (
				<Tooltip
					cursor={{ stroke: "var(--nq-border-strong)", strokeDasharray: "3 3" }}
					content={<ChartTooltip formatter={tooltipFormatter} colors={colors} />}
				/>
			) : null}
			{referenceY !== undefined ? (
				<ReferenceLine
					yAxisId="left"
					y={referenceY}
					stroke="var(--nq-subtle)"
					strokeDasharray="4 4"
					label={
						referenceLabel
							? {
									value: referenceLabel,
									fill: "var(--nq-muted)",
									fontSize: 12,
									position: "insideTopRight",
								}
							: undefined
					}
				/>
			) : null}
			{series.map((s, i) => (
				<Area
					key={s.key}
					yAxisId={s.yAxis ?? "left"}
					type={curve}
					dataKey={s.key}
					name={s.name ?? s.key}
					stackId={s.stackId}
					stroke={s.color ?? seriesColor(i)}
					strokeWidth={2}
					strokeDasharray={s.dashed ? "5 4" : undefined}
					fill={`url(#${gradientId}-${i})`}
					dot={false}
					activeDot={{ r: 4, strokeWidth: 0 }}
					isAnimationActive={false}
				/>
			))}
			{children}
		</RAreaChart>
	);
}

export interface BarChartProps extends CartesianChartProps {
	/** Horizontal bars. */
	layout?: "vertical" | "horizontal";
	/** Corner radius in pixels. */
	radius?: number;
	barSize?: number;
	/** Vertical gradient fade on each bar, as on the dashboard sales chart. */
	gradient?: boolean;
}

/** Rounded bar chart; `layout="horizontal"` gives ranked bars with category labels on the left. */
export function BarChart({
	data,
	xKey,
	series,
	height = 240,
	className,
	showGrid = true,
	showXAxis = true,
	showYAxis = true,
	showTooltip = true,
	xFormatter,
	yFormatter,
	tooltipFormatter,
	yDomain = [0, "auto"],
	referenceY,
	referenceLabel,
	children,
	layout = "vertical",
	radius = 6,
	barSize,
	gradient = true,
}: BarChartProps) {
	const horizontal = layout === "horizontal";
	const hasRight = series.some((s) => s.yAxis === "right");
	const colors = seriesColors(series);
	const gradientId = useGradientId("nq-bar");
	return (
		<RBarChart
			data={data}
			layout={horizontal ? "vertical" : "horizontal"}
			responsive
			style={{ width: "100%", height }}
			className={className}
			margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
			barCategoryGap="28%"
		>
			<defs>
				{series.map((s, i) => {
					const color = s.color ?? seriesColor(i);
					return (
						<linearGradient
							key={s.key}
							id={`${gradientId}-${i}`}
							x1="0"
							y1="0"
							x2={horizontal ? "1" : "0"}
							y2={horizontal ? "0" : "1"}
						>
							<stop offset="0%" stopColor={color} stopOpacity={1} />
							<stop offset="100%" stopColor={color} stopOpacity={gradient ? 0.45 : 1} />
						</linearGradient>
					);
				})}
			</defs>
			{showGrid ? (
				<CartesianGrid
					vertical={horizontal}
					horizontal={!horizontal}
					stroke="var(--nq-chart-grid)"
				/>
			) : null}
			{horizontal ? (
				<>
					<XAxis
						xAxisId="left"
						type="number"
						{...axisProps}
						tickFormatter={yFormatter}
						hide={!showXAxis}
						domain={yDomain}
					/>
					{hasRight ? (
						<XAxis
							xAxisId="right"
							orientation="top"
							type="number"
							{...axisProps}
							tickFormatter={yFormatter}
						/>
					) : null}
					<YAxis
						type="category"
						dataKey={xKey}
						{...axisProps}
						width="auto"
						tickFormatter={xFormatter}
						hide={!showYAxis}
					/>
				</>
			) : (
				<>
					<XAxis
						dataKey={xKey}
						{...axisProps}
						tickFormatter={xFormatter}
						hide={!showXAxis}
						interval="preserveStartEnd"
					/>
					<YAxis
						yAxisId="left"
						{...axisProps}
						width="auto"
						tickFormatter={yFormatter}
						hide={!showYAxis}
						domain={yDomain}
					/>
					{hasRight ? (
						<YAxis
							yAxisId="right"
							orientation="right"
							{...axisProps}
							width="auto"
							tickFormatter={yFormatter}
						/>
					) : null}
				</>
			)}
			{showTooltip ? (
				<Tooltip
					cursor={{ fill: "var(--nq-surface-2)" }}
					content={<ChartTooltip formatter={tooltipFormatter} colors={colors} />}
				/>
			) : null}
			{referenceY !== undefined ? (
				<ReferenceLine
					{...(horizontal
						? { xAxisId: "left", x: referenceY }
						: { yAxisId: "left", y: referenceY })}
					stroke="var(--nq-subtle)"
					strokeDasharray="4 4"
					label={
						referenceLabel
							? {
									value: referenceLabel,
									fill: "var(--nq-muted)",
									fontSize: 12,
									position: horizontal ? "insideTopLeft" : "insideTopRight",
								}
							: undefined
					}
				/>
			) : null}
			{series.map((s, i) => (
				<Bar
					key={s.key}
					{...(horizontal
						? { xAxisId: s.yAxis === "right" ? "right" : "left" }
						: { yAxisId: s.yAxis ?? "left" })}
					dataKey={s.key}
					name={s.name ?? s.key}
					stackId={s.stackId}
					fill={`url(#${gradientId}-${i})`}
					radius={horizontal ? [0, radius, radius, 0] : [radius, radius, radius, radius]}
					barSize={barSize}
					isAnimationActive={false}
				/>
			))}
			{children}
		</RBarChart>
	);
}
