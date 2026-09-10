import NumberFlow, { type NumberFlowProps } from "@number-flow/react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ComponentProps } from "react";
import { Chip, type ChipProps } from "../components/chip";
import { useFlash } from "../hooks/use-flash";
import { cn } from "../utils/cn";
import {
	formatCurrency,
	formatDelta,
	formatFixed,
	formatPercent,
	type Trend,
	trendOf,
} from "../utils/format";

export interface PriceTextProps extends Omit<ComponentProps<"span">, "children"> {
	value: number;
	/** Fixed decimals; defaults to 2. */
	decimals?: number;
	currency?: string;
	locale?: string;
	prefix?: string;
	suffix?: string;
	/** Color by this direction instead of neutral. */
	trend?: Trend | "auto";
	/** Compare against this value to derive `trend="auto"` and the change. */
	reference?: number;
	/** Animate digit transitions with NumberFlow. */
	animate?: boolean;
	/** Briefly tint the background when the value changes. */
	flash?: boolean;
	size?: "sm" | "md" | "lg" | "xl";
	weight?: "medium" | "semibold";
}

const sizes = { sm: "text-sm", md: "text-base", lg: "text-2xl", xl: "text-3xl tracking-tight" };
const trendClass: Record<Trend, string> = {
	up: "text-up-text",
	down: "text-down-text",
	flat: "text-foreground",
};
/**
 * Digit roll of an animated price, on the same curve as `--nq-ease`. NumberFlow's own
 * defaults run 900 ms, three times the 300 ms motion budget; `spinTiming` follows this.
 */
const NUMBER_TIMING = { duration: 300, easing: "cubic-bezier(0.16, 1, 0.3, 1)" };
/** Fade of digits that appear or disappear during the roll. */
const NUMBER_FADE_TIMING = { duration: 150, easing: "ease-out" };

const flashClass: Record<Trend, string> = {
	up: "animate-flash-up",
	down: "animate-flash-down",
	flat: "",
};

/** Tabular price that can animate and flash on updates. */
export function PriceText({
	value,
	decimals = 2,
	currency,
	locale,
	prefix,
	suffix,
	trend = "flat",
	reference,
	animate = true,
	flash = false,
	size = "md",
	weight = "medium",
	className,
	...props
}: PriceTextProps) {
	const flashTrend = useFlash(value);
	const resolvedTrend: Trend =
		trend === "auto" ? trendOf(reference === undefined ? 0 : value - reference) : trend;
	const format: NumberFlowProps["format"] = currency
		? {
				style: "currency",
				currency,
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals,
			}
		: { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
	return (
		<span
			{...props}
			className={cn(
				"relative isolate inline-flex items-baseline numeric rounded-sm px-1 -mx-1",
				sizes[size],
				weight === "semibold" ? "font-semibold" : "font-medium",
				trendClass[resolvedTrend],
				className,
			)}
		>
			{flash && flashTrend !== "flat" ? (
				// Keyed on the change so the animation restarts without remounting NumberFlow.
				<span
					key={`${flashTrend}-${value}`}
					aria-hidden
					className={cn(
						"-z-10 pointer-events-none absolute inset-0 rounded-sm",
						flashClass[flashTrend],
					)}
				/>
			) : null}
			{animate ? (
				<NumberFlow
					value={value}
					format={format}
					locales={locale}
					prefix={prefix}
					suffix={suffix}
					transformTiming={NUMBER_TIMING}
					opacityTiming={NUMBER_FADE_TIMING}
				/>
			) : (
				`${prefix ?? ""}${
					currency
						? formatCurrency(value, currency, {
								locale,
								minimumFractionDigits: decimals,
								maximumFractionDigits: decimals,
							})
						: formatFixed(value, decimals, { locale })
				}${suffix ?? ""}`
			)}
		</span>
	);
}

export interface DeltaChipProps extends Omit<ChipProps, "color" | "children" | "variant"> {
	/** Change as a ratio (0.032 = +3.2%) unless `absolute` is set. */
	value: number;
	/** Treat `value` as an absolute amount rather than a ratio. */
	absolute?: boolean;
	decimals?: number;
	/** Treat values within this magnitude as flat. */
	epsilon?: number;
	showIcon?: boolean;
	variant?: "soft" | "text" | "solid";
	/** Invert colors (e.g. lower latency is good). */
	invert?: boolean;
}

/** Tinted pill such as "↑ 3.3%"; the color follows the active market convention. */
export function DeltaChip({
	value,
	absolute,
	decimals = 2,
	epsilon = 0,
	showIcon = true,
	variant = "soft",
	invert,
	className,
	...props
}: DeltaChipProps) {
	const trend = trendOf(value, epsilon);
	const visual = invert ? (trend === "up" ? "down" : trend === "down" ? "up" : "flat") : trend;
	const color = visual === "up" ? "up" : visual === "down" ? "down" : "neutral";
	const text = absolute
		? formatDelta(value, { maximumFractionDigits: decimals })
		: formatPercent(value, { maximumFractionDigits: decimals });
	const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
	if (variant === "text") {
		return (
			<span
				{...props}
				className={cn(
					"inline-flex items-center gap-1 numeric font-medium text-xs",
					color === "up" ? "text-up-text" : color === "down" ? "text-down-text" : "text-muted",
					className,
				)}
			>
				{showIcon ? <Icon className="size-3" aria-hidden /> : null}
				{text}
			</span>
		);
	}
	return (
		<Chip
			{...props}
			variant={variant}
			color={color}
			className={cn("numeric", className)}
			startContent={showIcon ? <Icon aria-hidden /> : undefined}
		>
			{text}
		</Chip>
	);
}
