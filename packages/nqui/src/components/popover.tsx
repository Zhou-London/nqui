import type { ReactNode } from "react";
import {
	Popover as AriaPopover,
	type PopoverProps as AriaPopoverProps,
	composeRenderProps,
	DialogTrigger,
	OverlayArrow,
} from "react-aria-components";
import { tv } from "../utils/tv";

export const popoverStyles = tv({
	base: [
		"group z-50 rounded-xl border border-border bg-surface text-foreground shadow-lg",
		"entering:animate-zoom-in exiting:animate-zoom-out",
		"placement-top:origin-bottom placement-bottom:origin-top placement-left:origin-right placement-right:origin-left",
	],
});

export interface PopoverProps extends Omit<AriaPopoverProps, "className" | "children"> {
	className?: string;
	children?: ReactNode;
	showArrow?: boolean;
}

/** Floating panel anchored to its trigger. Put a `Dialog` inside for focus management. */
export function Popover({ children, className, showArrow, offset = 8, ...props }: PopoverProps) {
	return (
		<AriaPopover
			{...props}
			offset={offset}
			className={composeRenderProps(className, (cls) => popoverStyles({ className: cls }))}
		>
			{showArrow ? (
				<OverlayArrow>
					<svg
						aria-hidden
						width={12}
						height={12}
						viewBox="0 0 12 12"
						className="block fill-surface stroke-border group-placement-left:-rotate-90 group-placement-right:rotate-90 group-placement-bottom:rotate-180"
					>
						<path d="M0 0 L6 6 L12 0" />
					</svg>
				</OverlayArrow>
			) : null}
			{children}
		</AriaPopover>
	);
}

export { DialogTrigger as PopoverTrigger };
