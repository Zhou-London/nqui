import type { ComponentProps } from "react";
import { tv, type VariantProps } from "../utils/tv";

const spinnerStyles = tv({
	base: "inline-block animate-spin",
	variants: {
		size: {
			xs: "size-3",
			sm: "size-4",
			md: "size-5",
			lg: "size-8",
		},
		color: {
			current: "text-current",
			primary: "text-primary",
			muted: "text-muted",
		},
	},
	defaultVariants: { size: "md", color: "current" },
});

export interface SpinnerProps
	extends Omit<ComponentProps<"svg">, "color">,
		VariantProps<typeof spinnerStyles> {
	label?: string;
}

/** Rotating arc used for pending buttons and loading panels. */
export function Spinner({ size, color, label = "Loading", className, ...props }: SpinnerProps) {
	return (
		<svg
			{...props}
			viewBox="0 0 24 24"
			fill="none"
			role="img"
			aria-label={label}
			className={spinnerStyles({ size, color, className })}
		>
			<circle
				cx="12"
				cy="12"
				r="9.5"
				stroke="currentColor"
				strokeWidth="2.5"
				className="opacity-20"
			/>
			<path
				d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}
