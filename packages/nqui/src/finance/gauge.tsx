import type { ComponentProps, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface GaugeProps extends Omit<ComponentProps<"div">, "children"> {
	value: number;
	min?: number;
	max?: number;
	/** Pixel width; the arc is a half circle so height is about 60% of this. */
	size?: number;
	thickness?: number;
	label?: ReactNode;
	/** Text under the arc; defaults to the formatted value. */
	valueText?: ReactNode;
	/** Fractions (0-1) at which the arc turns warning and then danger. */
	thresholds?: [warning: number, danger: number];
	color?: "auto" | "primary" | "success" | "warning" | "danger";
	format?: (value: number) => string;
}

const colorClass = {
	primary: "text-primary",
	success: "text-success",
	warning: "text-warning",
	danger: "text-danger",
};

/** Semicircular dial for utilization, latency budgets, and risk scores. */
export function Gauge({
	value,
	min = 0,
	max = 100,
	size = 160,
	thickness = 12,
	label,
	valueText,
	thresholds = [0.7, 0.9],
	color = "auto",
	format = (v) => `${Math.round(v)}%`,
	className,
	...props
}: GaugeProps) {
	const safeValue = Number.isFinite(value) ? value : 0;
	const ratio = Math.min(1, Math.max(0, (safeValue - min) / (max - min || 1)));
	const resolved =
		color === "auto"
			? ratio >= thresholds[1]
				? "danger"
				: ratio >= thresholds[0]
					? "warning"
					: "success"
			: color;
	const r = (size - thickness) / 2;
	const cy = size / 2;
	const circumference = Math.PI * r;
	const path = `M ${thickness / 2} ${cy} A ${r} ${r} 0 0 1 ${size - thickness / 2} ${cy}`;
	return (
		<div
			{...props}
			className={cn("inline-flex flex-col items-center", className)}
			style={{ width: size }}
		>
			<svg
				width={size}
				height={size / 2 + thickness / 2}
				viewBox={`0 0 ${size} ${size / 2 + thickness / 2}`}
				role="img"
				aria-label={`${format(safeValue)}`}
			>
				<path
					d={path}
					fill="none"
					stroke="var(--nq-surface-3)"
					strokeWidth={thickness}
					strokeLinecap="round"
				/>
				<path
					d={path}
					fill="none"
					stroke="currentColor"
					strokeWidth={thickness}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={circumference * (1 - ratio)}
					className={cn(
						"transition-[stroke-dashoffset] duration-500 ease-expo",
						colorClass[resolved],
					)}
				/>
			</svg>
			<div className="-mt-6 flex flex-col items-center">
				<span className="numeric font-semibold text-2xl text-foreground tracking-tight">
					{valueText ?? format(safeValue)}
				</span>
				{label ? <span className="text-muted text-xs">{label}</span> : null}
			</div>
		</div>
	);
}
