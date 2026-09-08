import type { ComponentProps } from "react";
import { tv, type VariantProps } from "../utils/tv";

const dotStyles = tv({
	base: "relative inline-flex shrink-0 rounded-full",
	variants: {
		color: {
			success: "bg-success",
			warning: "bg-warning",
			danger: "bg-danger",
			info: "bg-info",
			primary: "bg-primary",
			neutral: "bg-subtle",
		},
		size: {
			sm: "size-1.5",
			md: "size-2",
			lg: "size-2.5",
		},
	},
	defaultVariants: { color: "success", size: "md" },
});

const statusToColor = {
	healthy: "success",
	degraded: "warning",
	down: "danger",
	unknown: "neutral",
	running: "info",
	pending: "primary",
} as const;

export interface StatusDotProps
	extends Omit<ComponentProps<"span">, "color">,
		VariantProps<typeof dotStyles> {
	/** Service status shorthand that maps to a color. */
	status?: keyof typeof statusToColor;
	/** Radiating ring animation, for live or streaming states. */
	pulse?: boolean;
	label?: string;
}

/** Tiny colored circle used in status columns, sidebars, and legends. */
export function StatusDot({
	status,
	color,
	size,
	pulse,
	label,
	className,
	...props
}: StatusDotProps) {
	const resolved = color ?? (status ? statusToColor[status] : undefined);
	return (
		<span {...props} className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
			<span className={dotStyles({ color: resolved, size })} aria-hidden={label ? undefined : true}>
				{pulse ? (
					<span
						className={dotStyles({
							color: resolved,
							className: "absolute inset-0 animate-ping opacity-60",
						})}
					/>
				) : null}
			</span>
			{label ? <span className="text-sm">{label}</span> : null}
		</span>
	);
}
