import type { ComponentProps, ReactNode } from "react";
import { cn } from "../utils/cn";
import { formatFixed } from "../utils/format";
import { DeltaChip } from "./price";

export interface TickerItem {
	symbol: string;
	price: number;
	/** Change ratio. */
	change: number;
	decimals?: number;
	icon?: ReactNode;
}

export interface TickerTapeProps extends Omit<ComponentProps<"div">, "children"> {
	items: TickerItem[];
	/** Seconds for one full loop. */
	duration?: number;
	pauseOnHover?: boolean;
	onItemPress?: (item: TickerItem) => void;
}

/** Endless horizontal marquee of symbol, price, and change. */
export function TickerTape({
	items,
	duration = 40,
	pauseOnHover = true,
	onItemPress,
	className,
	style,
	...props
}: TickerTapeProps) {
	const track = (ariaHidden?: boolean) => (
		<div aria-hidden={ariaHidden} className="flex shrink-0 items-center">
			{items.map((it, i) => (
				<button
					// biome-ignore lint/suspicious/noArrayIndexKey: a symbol can repeat in the tape, so the position disambiguates it
					key={`${it.symbol}-${i}`}
					type="button"
					tabIndex={ariaHidden ? -1 : 0}
					onClick={onItemPress ? () => onItemPress(it) : undefined}
					className="flex h-9 items-center gap-2 border-border border-r px-4 text-sm outline-hidden last:border-r-0 hover:bg-surface-2 focus-visible:bg-surface-2"
				>
					{it.icon}
					<span className="font-semibold text-foreground">{it.symbol}</span>
					<span className="numeric text-foreground">{formatFixed(it.price, it.decimals ?? 2)}</span>
					<DeltaChip value={it.change} variant="text" />
				</button>
			))}
		</div>
	);
	return (
		<div
			{...props}
			className={cn(
				"group/tape relative flex w-full overflow-hidden border-border border-y bg-surface",
				className,
			)}
			style={{ "--nq-marquee-duration": `${duration}s`, ...style } as React.CSSProperties}
		>
			<div
				className={cn(
					"flex animate-marquee",
					pauseOnHover && "group-hover/tape:[animation-play-state:paused]",
				)}
			>
				{track()}
				{track(true)}
			</div>
		</div>
	);
}
