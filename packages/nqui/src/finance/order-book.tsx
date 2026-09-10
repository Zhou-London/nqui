import { type ComponentProps, useMemo } from "react";
import { cn } from "../utils/cn";
import { formatCompact, formatFixed } from "../utils/format";

/** `[price, size]` tuple. */
export type OrderLevel = [price: number, size: number];

export interface OrderBookProps extends Omit<ComponentProps<"div">, "children"> {
	bids: OrderLevel[];
	asks: OrderLevel[];
	/** Levels shown per side. */
	depth?: number;
	priceDecimals?: number;
	sizeDecimals?: number;
	/** Stack asks above bids (default) or place them side by side. */
	layout?: "stacked" | "split";
	/** Show a cumulative total column. */
	showTotal?: boolean;
	/** Last traded price displayed in the spread row. */
	lastPrice?: number;
	lastTrend?: "up" | "down" | "flat";
	onLevelPress?: (side: "bid" | "ask", level: OrderLevel) => void;
	/** Use compact notation for large sizes. */
	compactSizes?: boolean;
}

interface Level {
	price: number;
	size: number;
	total: number;
	pct: number;
}

/** Best price first (highest bid, lowest ask), duplicate prices merged, truncated to `depth`. */
function accumulate(levels: OrderLevel[], side: "bid" | "ask", depth: number): Level[] {
	const merged = new Map<number, number>();
	for (const [price, size] of levels) merged.set(price, (merged.get(price) ?? 0) + size);
	const sorted = [...merged.entries()].sort(([a], [b]) => (side === "bid" ? b - a : a - b));
	let total = 0;
	const out = sorted.slice(0, depth).map(([price, size]) => {
		total += size;
		return { price, size, total, pct: 0 };
	});
	const max = out[out.length - 1]?.total || 1;
	for (const l of out) l.pct = (l.total / max) * 100;
	return out;
}

interface LevelRowProps {
	level: Level;
	side: "bid" | "ask";
	mirror?: boolean;
	showTotal: boolean;
	priceDecimals: number;
	fmtSize: (n: number) => string;
	onLevelPress?: OrderBookProps["onLevelPress"];
}

function LevelRow({
	level,
	side,
	mirror,
	showTotal,
	priceDecimals,
	fmtSize,
	onLevelPress,
}: LevelRowProps) {
	return (
		<button
			type="button"
			onClick={onLevelPress ? () => onLevelPress(side, [level.price, level.size]) : undefined}
			className={cn(
				"relative grid h-6 w-full items-center gap-2 px-2 text-left numeric text-xs outline-hidden hover:bg-surface-2 focus-visible:bg-surface-2 max-lg:h-11",
				showTotal ? "grid-cols-[1fr_1fr_1fr]" : "grid-cols-[1fr_1fr]",
			)}
			style={{ direction: mirror ? "rtl" : undefined }}
		>
			<span
				aria-hidden
				className={cn(
					"absolute inset-y-0.5 opacity-100",
					side === "bid" ? "bg-up-soft" : "bg-down-soft",
					mirror ? "left-0" : "right-0",
				)}
				style={{ width: `${level.pct}%` }}
			/>
			<span
				className={cn("relative font-medium", side === "bid" ? "text-up-text" : "text-down-text")}
			>
				{formatFixed(level.price, priceDecimals)}
			</span>
			<span className="relative text-right text-foreground">{fmtSize(level.size)}</span>
			{showTotal ? (
				<span className="relative text-right text-muted">{fmtSize(level.total)}</span>
			) : null}
		</button>
	);
}

/** Level-2 ladder with depth bars, spread row, and optional cumulative totals. */
export function OrderBook({
	bids,
	asks,
	depth = 12,
	priceDecimals = 2,
	sizeDecimals = 4,
	layout = "stacked",
	showTotal = true,
	lastPrice,
	lastTrend = "flat",
	onLevelPress,
	compactSizes = false,
	className,
	...props
}: OrderBookProps) {
	const bidLevels = useMemo(() => accumulate(bids, "bid", depth), [bids, depth]);
	const askLevels = useMemo(() => accumulate(asks, "ask", depth), [asks, depth]);
	const bestBid = bidLevels[0]?.price;
	const bestAsk = askLevels[0]?.price;
	const spread = bestBid !== undefined && bestAsk !== undefined ? bestAsk - bestBid : undefined;
	const spreadPct = spread !== undefined && bestAsk ? spread / bestAsk : undefined;
	const fmtSize = (n: number) =>
		compactSizes ? formatCompact(n, { maximumFractionDigits: 2 }) : formatFixed(n, sizeDecimals);

	const row = (level: Level, i: number, side: "bid" | "ask", mirror?: boolean) => (
		<LevelRow
			key={`${i}-${level.price}`}
			level={level}
			side={side}
			mirror={mirror}
			showTotal={showTotal}
			priceDecimals={priceDecimals}
			fmtSize={fmtSize}
			onLevelPress={onLevelPress}
		/>
	);

	const header = (mirror?: boolean) => (
		<div
			className={cn(
				"grid h-8 items-center gap-2 border-border border-b px-2 text-muted text-xs uppercase tracking-wide",
				showTotal ? "grid-cols-[1fr_1fr_1fr]" : "grid-cols-[1fr_1fr]",
			)}
			style={{ direction: mirror ? "rtl" : undefined }}
		>
			<span>Price</span>
			<span className="text-right">Size</span>
			{showTotal ? <span className="text-right">Total</span> : null}
		</div>
	);

	const spreadRow = (
		<div className="flex h-8 items-center justify-between gap-2 border-border border-y bg-surface-2 px-2 text-xs">
			{lastPrice !== undefined ? (
				<span
					className={cn(
						"numeric font-semibold",
						lastTrend === "up"
							? "text-up-text"
							: lastTrend === "down"
								? "text-down-text"
								: "text-foreground",
					)}
				>
					{formatFixed(lastPrice, priceDecimals)}
				</span>
			) : (
				<span className="text-muted">Spread</span>
			)}
			<span className="numeric text-muted">
				{spread !== undefined ? formatFixed(spread, priceDecimals) : "–"}
				{spreadPct !== undefined ? ` (${(spreadPct * 100).toFixed(3)}%)` : ""}
			</span>
		</div>
	);

	if (layout === "split") {
		return (
			<div
				{...props}
				className={cn(
					"flex flex-col overflow-hidden rounded-xl border border-border bg-surface",
					className,
				)}
			>
				{spreadRow}
				<div className="grid grid-cols-2">
					<div>
						{header(true)}
						{bidLevels.map((l, i) => row(l, i, "bid", true))}
					</div>
					<div className="border-border border-l">
						{header()}
						{askLevels.map((l, i) => row(l, i, "ask"))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			{...props}
			className={cn(
				"flex flex-col overflow-hidden rounded-xl border border-border bg-surface",
				className,
			)}
		>
			{header()}
			<div className="flex flex-col-reverse">{askLevels.map((l, i) => row(l, i, "ask"))}</div>
			{spreadRow}
			<div>{bidLevels.map((l, i) => row(l, i, "bid"))}</div>
		</div>
	);
}
