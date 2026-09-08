import type { ReactNode } from "react";
import { Separator, type SeparatorProps } from "react-aria-components";
import { tv } from "../utils/tv";

const dividerStyles = tv({
	base: "shrink-0 border-0 bg-border",
	variants: {
		orientation: {
			horizontal: "h-px w-full",
			vertical: "h-auto w-px self-stretch",
		},
	},
	defaultVariants: { orientation: "horizontal" },
});

export interface DividerProps extends SeparatorProps {
	/** Optional centered label, e.g. "or". */
	label?: ReactNode;
}

export function Divider({ orientation = "horizontal", label, className, ...props }: DividerProps) {
	if (label && orientation === "horizontal") {
		return (
			<div className={`flex items-center gap-3 ${className ?? ""}`}>
				<Separator
					{...props}
					className={dividerStyles({ orientation: "horizontal", className: "flex-1" })}
				/>
				<span className="text-muted text-xs">{label}</span>
				<Separator
					aria-hidden
					className={dividerStyles({ orientation: "horizontal", className: "flex-1" })}
				/>
			</div>
		);
	}
	return (
		<Separator
			{...props}
			orientation={orientation}
			className={dividerStyles({ orientation, className })}
		/>
	);
}
