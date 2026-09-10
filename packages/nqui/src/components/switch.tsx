import type { ReactNode } from "react";
import {
	Switch as AriaSwitch,
	type SwitchProps as AriaSwitchProps,
	composeRenderProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRingGroup } from "../utils/focus-ring";
import { tv, type VariantProps } from "../utils/tv";

const trackStyles = tv({
	extend: focusRingGroup,
	base: [
		"relative inline-flex shrink-0 cursor-default items-center rounded-full bg-surface-3 p-1 transition-colors duration-200",
		"group-hover:bg-border-strong",
		"group-disabled:opacity-50",
	],
	variants: {
		color: {
			primary: "group-selected:bg-primary group-selected:group-hover:bg-primary/90",
			accent: "group-selected:bg-accent group-selected:group-hover:bg-accent/90",
			success: "group-selected:bg-success group-selected:group-hover:bg-success/90",
		},
		size: {
			sm: "h-6 w-10",
			md: "h-8 w-14",
			lg: "h-10 w-16",
		},
	},
	defaultVariants: { color: "primary", size: "md" },
});

const thumbStyles = tv({
	base: "block rounded-full bg-surface shadow-sm transition-transform duration-200 ease-expo group-pressed:scale-x-110 group-selected:group-pressed:origin-right",
	variants: {
		size: {
			sm: "size-4 group-selected:translate-x-4",
			md: "size-6 group-selected:translate-x-6",
			lg: "size-8 group-selected:translate-x-6",
		},
	},
	defaultVariants: { size: "md" },
});

export interface SwitchProps
	extends Omit<AriaSwitchProps, "className" | "children">,
		VariantProps<typeof trackStyles> {
	className?: AriaSwitchProps["className"];
	children?: ReactNode;
	description?: ReactNode;
	/** Put the label before the switch. */
	labelPlacement?: "start" | "end";
}

export function Switch({
	color,
	size,
	className,
	children,
	description,
	labelPlacement = "end",
	...props
}: SwitchProps) {
	const label =
		children || description ? (
			<span className="flex flex-col gap-1">
				<span>{children}</span>
				{description ? <span className="text-muted text-xs">{description}</span> : null}
			</span>
		) : null;
	return (
		<AriaSwitch
			{...props}
			className={composeRenderProps(className, (cls) =>
				cn(
					"group relative touch-target flex items-center gap-2 text-foreground text-sm",
					labelPlacement === "start" && "flex-row-reverse justify-end",
					cls,
				),
			)}
		>
			<span className={trackStyles({ color, size })}>
				<span className={thumbStyles({ size })} />
			</span>
			{label}
		</AriaSwitch>
	);
}
