import type { ReactNode } from "react";
import {
	Tooltip as AriaTooltip,
	type TooltipProps as AriaTooltipProps,
	TooltipTrigger as AriaTooltipTrigger,
	composeRenderProps,
	OverlayArrow,
	type TooltipTriggerComponentProps,
} from "react-aria-components";
import { tv } from "../utils/tv";

const tooltipStyles = tv({
	base: [
		"group z-50 max-w-xs rounded-lg bg-accent px-2.5 py-1.5 text-accent-foreground text-xs shadow-md",
		"entering:animate-fade-in exiting:animate-fade-out",
	],
});

export interface TooltipProps extends Omit<AriaTooltipProps, "className" | "children"> {
	className?: string;
	children?: ReactNode;
	/** Hide the small arrow. */
	hideArrow?: boolean;
}

/** Dark bubble with an arrow. Wrap the trigger and the tooltip in `TooltipTrigger`. */
export function Tooltip({ children, hideArrow, className, offset = 6, ...props }: TooltipProps) {
	return (
		<AriaTooltip
			{...props}
			offset={offset}
			className={composeRenderProps(className, (cls) => tooltipStyles({ className: cls }))}
		>
			{hideArrow ? null : (
				<OverlayArrow>
					<svg
						aria-hidden
						width={8}
						height={8}
						viewBox="0 0 8 8"
						className="fill-accent group-placement-left:-rotate-90 group-placement-right:rotate-90 group-placement-bottom:rotate-180"
					>
						<path d="M0 0 L4 4 L8 0" />
					</svg>
				</OverlayArrow>
			)}
			{children}
		</AriaTooltip>
	);
}

export interface TooltipTriggerProps extends TooltipTriggerComponentProps {}

export function TooltipTrigger({ delay = 400, closeDelay = 100, ...props }: TooltipTriggerProps) {
	return <AriaTooltipTrigger delay={delay} closeDelay={closeDelay} {...props} />;
}
