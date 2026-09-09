import type { ComponentProps, ReactNode } from "react";
import { cn } from "../utils/cn";
import { extent } from "../utils/extent";

export interface HeatmapProps extends Omit<ComponentProps<"div">, "children"> {
	rows: string[];
	cols: string[];
	/** `values[rowIndex][colIndex]` */
	values: (number | null | undefined)[][];
	/** `diverging` maps negative to down and positive to up around zero; `sequential` maps min..max to primary. */
	scale?: "diverging" | "sequential";
	/** Fix the color domain; defaults to the data extent. */
	domain?: [min: number, max: number];
	showValues?: boolean;
	format?: (value: number) => ReactNode;
	cellSize?: number;
	onCellPress?: (row: string, col: string, value: number | null | undefined) => void;
}

/** Correlation matrix or calendar grid colored by value. */
export function Heatmap({
	rows,
	cols,
	values,
	scale = "diverging",
	domain,
	showValues = true,
	format = (v) => v.toFixed(2),
	cellSize = 40,
	onCellPress,
	className,
	...props
}: HeatmapProps) {
	const flat = values
		.flat()
		.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
	const [flatMin, flatMax] = extent(flat) ?? [0, 0];
	const dataMin = domain?.[0] ?? Math.min(flatMin, 0);
	const dataMax = domain?.[1] ?? Math.max(flatMax, 0);
	const absMax = Math.max(Math.abs(dataMin), Math.abs(dataMax)) || 1;

	const background = (v: number | null | undefined): string => {
		if (v === null || v === undefined || !Number.isFinite(v)) return "var(--nq-surface-2)";
		if (scale === "diverging") {
			const pct = Math.round((Math.abs(v) / absMax) * 85);
			return `color-mix(in oklab, var(${v >= 0 ? "--nq-up" : "--nq-down"}) ${pct}%, var(--nq-surface))`;
		}
		const pct = Math.round(((v - dataMin) / (dataMax - dataMin || 1)) * 90);
		return `color-mix(in oklab, var(--nq-primary) ${pct}%, var(--nq-surface))`;
	};
	const foreground = (v: number | null | undefined): string | undefined => {
		if (v === null || v === undefined) return undefined;
		const strength =
			scale === "diverging" ? Math.abs(v) / absMax : (v - dataMin) / (dataMax - dataMin || 1);
		return strength > 0.55 ? "var(--nq-primary-fg)" : undefined;
	};

	return (
		<div {...props} className={cn("inline-block overflow-auto", className)}>
			<div
				className="grid gap-px text-xs"
				style={{ gridTemplateColumns: `auto repeat(${cols.length}, ${cellSize}px)` }}
			>
				<div />
				{cols.map((c) => (
					<div key={c} className="truncate px-1 pb-1 text-center text-muted" title={c}>
						{c}
					</div>
				))}
				{rows.map((r, ri) => (
					<HeatmapRow
						key={r}
						label={r}
						cells={cols.map((c, ci) => ({ col: c, value: values[ri]?.[ci] }))}
						cellSize={cellSize}
						showValues={showValues}
						format={format}
						background={background}
						foreground={foreground}
						onCellPress={onCellPress}
					/>
				))}
			</div>
		</div>
	);
}

interface HeatmapRowProps {
	label: string;
	cells: { col: string; value: number | null | undefined }[];
	cellSize: number;
	showValues: boolean;
	format: (value: number) => ReactNode;
	background: (value: number | null | undefined) => string;
	foreground: (value: number | null | undefined) => string | undefined;
	onCellPress?: HeatmapProps["onCellPress"];
}

function HeatmapRow({
	label,
	cells,
	cellSize,
	showValues,
	format,
	background,
	foreground,
	onCellPress,
}: HeatmapRowProps) {
	return (
		<>
			<div className="flex items-center justify-end pr-2 text-muted" title={label}>
				{label}
			</div>
			{cells.map(({ col, value }) => (
				<button
					key={col}
					type="button"
					title={`${label} × ${col}: ${value ?? "–"}`}
					onClick={onCellPress ? () => onCellPress(label, col, value) : undefined}
					className={cn(
						"flex items-center justify-center rounded-sm numeric outline-hidden transition-transform focus-visible:ring-2 focus-visible:ring-focus/70",
						onCellPress && "hover:scale-105",
					)}
					style={{ height: cellSize, background: background(value), color: foreground(value) }}
				>
					{showValues && value !== null && value !== undefined ? format(value) : ""}
				</button>
			))}
		</>
	);
}
