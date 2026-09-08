import { type ComponentProps, useMemo } from "react";
import { cn } from "../utils/cn";
import { formatFixed } from "../utils/format";
import type { OrderLevel } from "./order-book";

export interface DepthChartProps extends Omit<ComponentProps<"svg">, "width" | "height"> {
	bids: OrderLevel[];
	asks: OrderLevel[];
	width?: number | string;
	height?: number;
	priceDecimals?: number;
	/** Show mid price label. */
	showMid?: boolean;
}

function cumulative(levels: OrderLevel[]): { price: number; total: number }[] {
	let t = 0;
	return levels.map(([price, size]) => {
		t += size;
		return { price, total: t };
	});
}

/** Cumulative bid/ask depth as mirrored step areas. */
export function DepthChart({
	bids,
	asks,
	width = "100%",
	height = 160,
	priceDecimals = 2,
	showMid = true,
	className,
	...props
}: DepthChartProps) {
	const { bidPath, askPath, mid, bidArea, askArea } = useMemo(() => {
		const w = 100;
		const h = height;
		const b = cumulative([...bids].sort((x, y) => y[0] - x[0]));
		const a = cumulative([...asks].sort((x, y) => x[0] - y[0]));
		const prices = [...b.map((l) => l.price), ...a.map((l) => l.price)];
		const minP = Math.min(...prices);
		const maxP = Math.max(...prices);
		const maxT = Math.max(b[b.length - 1]?.total ?? 0, a[a.length - 1]?.total ?? 0) || 1;
		const x = (p: number) => ((p - minP) / (maxP - minP || 1)) * w;
		const y = (t: number) => h - 2 - (t / maxT) * (h - 6);
		const step = (levels: { price: number; total: number }[], reverse: boolean) => {
			const pts = levels.map((l) => [x(l.price), y(l.total)] as [number, number]);
			if (reverse) pts.reverse();
			let d = "";
			pts.forEach((p, i) => {
				if (i === 0) d += `M${p[0]} ${p[1]}`;
				else {
					const prev = pts[i - 1] as [number, number];
					d += ` L${p[0]} ${prev[1]} L${p[0]} ${p[1]}`;
				}
			});
			return { d, first: pts[0], last: pts[pts.length - 1] };
		};
		const bs = step(b, true);
		const as = step(a, false);
		const bidArea = bs.first && bs.last ? `${bs.d} L${bs.last[0]} ${h} L${bs.first[0]} ${h} Z` : "";
		const askArea = as.first && as.last ? `${as.d} L${as.last[0]} ${h} L${as.first[0]} ${h} Z` : "";
		const bestBid = b[0]?.price;
		const bestAsk = a[0]?.price;
		const midPrice =
			bestBid !== undefined && bestAsk !== undefined ? (bestBid + bestAsk) / 2 : undefined;
		return {
			bidPath: bs.d,
			askPath: as.d,
			bidArea,
			askArea,
			mid: midPrice !== undefined ? { x: x(midPrice), price: midPrice } : undefined,
		};
	}, [bids, asks, height]);

	return (
		<div className={cn("relative w-full", className)} style={{ width }}>
			<svg
				{...props}
				viewBox={`0 0 100 ${height}`}
				preserveAspectRatio="none"
				width="100%"
				height={height}
				aria-hidden
				className="block overflow-visible"
			>
				<path d={bidArea} className="fill-up/15" />
				<path d={askArea} className="fill-down/15" />
				<path
					d={bidPath}
					fill="none"
					className="stroke-up"
					strokeWidth={1.5}
					vectorEffect="non-scaling-stroke"
				/>
				<path
					d={askPath}
					fill="none"
					className="stroke-down"
					strokeWidth={1.5}
					vectorEffect="non-scaling-stroke"
				/>
				{mid && showMid ? (
					<line
						x1={mid.x}
						x2={mid.x}
						y1={0}
						y2={height}
						className="stroke-border-strong"
						strokeDasharray="3 3"
						vectorEffect="non-scaling-stroke"
					/>
				) : null}
			</svg>
			{mid && showMid ? (
				<span
					className="-translate-x-1/2 absolute top-1 numeric rounded-md bg-surface px-1.5 py-0.5 text-2xs text-muted shadow-xs"
					style={{ left: `${mid.x}%` }}
				>
					{formatFixed(mid.price, priceDecimals)}
				</span>
			) : null}
		</div>
	);
}
