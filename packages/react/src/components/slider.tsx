import type { ReactNode } from "react";
import {
	Slider as AriaSlider,
	type SliderProps as AriaSliderProps,
	composeRenderProps,
	SliderOutput,
	SliderThumb,
	SliderTrack,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { tv } from "../utils/tv";
import { Label } from "./field";

const thumbStyles = tv({
	base: [
		"size-4 rounded-full border-2 border-primary bg-surface shadow-sm transition-[transform,box-shadow] duration-150",
		"dragging:scale-110 hover:scale-105",
		"focus-visible:ring-2 focus-visible:ring-focus/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
		"disabled:border-subtle",
	],
});

export interface SliderProps<T extends number | number[]>
	extends Omit<AriaSliderProps<T>, "className"> {
	className?: string;
	label?: ReactNode;
	/** Custom value rendering; defaults to the localized value text. */
	renderValue?: (values: number[]) => ReactNode;
	color?: "primary" | "accent";
}

/** Single- or multi-thumb slider; pass an array `value` for a range. */
export function Slider<T extends number | number[]>({
	label,
	renderValue,
	color = "primary",
	className,
	...props
}: SliderProps<T>) {
	const fill = color === "primary" ? "bg-primary" : "bg-accent";
	return (
		<AriaSlider
			{...props}
			className={composeRenderProps(className, (cls) =>
				cn("group flex w-full flex-col gap-2", cls),
			)}
		>
			{label || renderValue !== undefined ? (
				<div className="flex items-center justify-between text-sm">
					{label ? <Label>{label}</Label> : <span />}
					<SliderOutput className="numeric text-muted">
						{({ state }) =>
							renderValue
								? renderValue(state.values)
								: state.values.map((_, i) => state.getThumbValueLabel(i)).join(" – ")
						}
					</SliderOutput>
				</div>
			) : null}
			<SliderTrack className="relative h-5 w-full group-orientation-vertical:h-full group-orientation-vertical:w-5">
				{({ state }) => {
					const min = state.getThumbPercent(0) * 100;
					const max =
						state.values.length > 1 ? state.getThumbPercent(state.values.length - 1) * 100 : min;
					const start = state.values.length > 1 ? min : 0;
					const end = state.values.length > 1 ? max : min;
					return (
						<>
							<div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-surface-3" />
							<div
								className={cn("absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full", fill)}
								style={{ left: `${start}%`, width: `${end - start}%` }}
							/>
							{state.values.map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional
								<SliderThumb key={i} index={i} className={thumbStyles({ className: "top-1/2" })} />
							))}
						</>
					);
				}}
			</SliderTrack>
		</AriaSlider>
	);
}
