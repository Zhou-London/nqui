import { type ComponentProps, useId } from "react";
import { cn } from "../utils/cn";

export interface SparklineProps extends Omit<ComponentProps<"svg">, "width" | "height"> {
	data: number[];
	width?: number | string;
	height?: number;
	/** `auto` picks up/down from the first and last values. */
	color?: "auto" | "primary" | "up" | "down" | "muted" | "warning" | "current";
	/** Fill the area under the line with a fading gradient. */
	area?: boolean;
	strokeWidth?: number;
	/** Smooth the line with curves instead of straight segments. */
	smooth?: boolean;
	/** Draw a dashed reference line at this value. */
	baseline?: number;
	/** Highlight the last point with a dot. */
	showLast?: boolean;
	/** Fix the y-domain instead of fitting to the data. */
	domain?: [min: number, max: number];
}

const colorClass = {
	primary: "text-primary",
	up: "text-up",
	down: "text-down",
	muted: "text-muted",
	warning: "text-warning",
	current: "",
};

/** Build an SVG path for the series in a 0..w x 0..h box. */
export function sparklinePath(
	data: number[],
	w: number,
	h: number,
	smooth: boolean,
	domain?: [number, number],
): { line: string; points: [number, number][] } {
	if (data.length === 0) return { line: "", points: [] };
	const min = domain ? domain[0] : Math.min(...data);
	const max = domain ? domain[1] : Math.max(...data);
	const span = max - min || 1;
	const pad = 1.5;
	const points: [number, number][] = data.map((v, i) => [
		data.length === 1 ? w / 2 : (i / (data.length - 1)) * w,
		h - pad - ((v - min) / span) * (h - pad * 2),
	]);
	if (!smooth || points.length < 3) {
		return {
			line: points
				.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
				.join(" "),
			points,
		};
	}
	let d = `M${points[0]?.[0].toFixed(2)} ${points[0]?.[1].toFixed(2)}`;
	for (let i = 0; i < points.length - 1; i++) {
		const p0 = points[i - 1] ?? points[i];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = points[i + 2] ?? p2;
		if (!p0 || !p1 || !p2 || !p3) continue;
		const c1x = p1[0] + (p2[0] - p0[0]) / 6;
		const c1y = p1[1] + (p2[1] - p0[1]) / 6;
		const c2x = p2[0] - (p3[0] - p1[0]) / 6;
		const c2y = p2[1] - (p3[1] - p1[1]) / 6;
		d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
	}
	return { line: d, points };
}

/** Tiny inline trend line for KPI cards and table cells. */
export function Sparkline({
	data,
	width = "100%",
	height = 32,
	color = "auto",
	area = true,
	strokeWidth = 1.5,
	smooth = true,
	baseline,
	showLast = false,
	domain,
	className,
	...props
}: SparklineProps) {
	const id = useId();
	const w = 100;
	const h = height;
	const { line, points } = sparklinePath(data, w, h, smooth, domain);
	const last = points[points.length - 1];
	const resolved =
		color === "auto" ? ((data[data.length - 1] ?? 0) >= (data[0] ?? 0) ? "up" : "down") : color;
	const min = domain ? domain[0] : Math.min(...data);
	const max = domain ? domain[1] : Math.max(...data);
	const baseY =
		baseline === undefined ? undefined : h - 1.5 - ((baseline - min) / (max - min || 1)) * (h - 3);
	return (
		<svg
			{...props}
			viewBox={`0 0 ${w} ${h}`}
			preserveAspectRatio="none"
			width={width}
			height={h}
			aria-hidden
			className={cn("block overflow-visible", colorClass[resolved], className)}
		>
			{area && line ? (
				<>
					<defs>
						<linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
							<stop offset="100%" stopColor="currentColor" stopOpacity="0" />
						</linearGradient>
					</defs>
					<path d={`${line} L${w} ${h} L0 ${h} Z`} fill={`url(#${id})`} stroke="none" />
				</>
			) : null}
			{baseY !== undefined ? (
				<line
					x1="0"
					x2={w}
					y1={baseY}
					y2={baseY}
					stroke="currentColor"
					strokeOpacity="0.3"
					strokeDasharray="2 2"
					vectorEffect="non-scaling-stroke"
				/>
			) : null}
			<path
				d={line}
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
			/>
			{showLast && last ? (
				<circle
					cx={last[0]}
					cy={last[1]}
					r={strokeWidth + 1}
					fill="currentColor"
					vectorEffect="non-scaling-stroke"
				/>
			) : null}
		</svg>
	);
}
