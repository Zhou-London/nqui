import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { tv, type VariantProps } from "../utils/tv";
import { IconButton } from "./button";

const alertStyles = tv({
	base: "relative flex w-full items-start gap-3 rounded-xl border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
	variants: {
		variant: {
			soft: "border-transparent",
			outline: "bg-surface",
		},
		color: {
			neutral: "",
			primary: "",
			success: "",
			warning: "",
			danger: "",
			info: "",
		},
	},
	compoundVariants: [
		{ variant: "soft", color: "neutral", class: "bg-surface-2 text-foreground [&>svg]:text-muted" },
		{ variant: "soft", color: "primary", class: "bg-primary-soft text-primary-text" },
		{ variant: "soft", color: "success", class: "bg-success-soft text-success-text" },
		{ variant: "soft", color: "warning", class: "bg-warning-soft text-warning-text" },
		{ variant: "soft", color: "danger", class: "bg-danger-soft text-danger-text" },
		{ variant: "soft", color: "info", class: "bg-info-soft text-info-text" },
		{
			variant: "outline",
			color: "neutral",
			class: "border-border text-foreground [&>svg]:text-muted",
		},
		{
			variant: "outline",
			color: "primary",
			class: "border-primary/30 text-foreground [&>svg]:text-primary",
		},
		{
			variant: "outline",
			color: "success",
			class: "border-success/30 text-foreground [&>svg]:text-success",
		},
		{
			variant: "outline",
			color: "warning",
			class: "border-warning/40 text-foreground [&>svg]:text-warning",
		},
		{
			variant: "outline",
			color: "danger",
			class: "border-danger/30 text-foreground [&>svg]:text-danger",
		},
		{
			variant: "outline",
			color: "info",
			class: "border-info/30 text-foreground [&>svg]:text-info",
		},
	],
	defaultVariants: { variant: "soft", color: "neutral" },
});

const defaultIcons: Record<NonNullable<VariantProps<typeof alertStyles>["color"]>, ReactNode> = {
	neutral: <Info aria-hidden />,
	primary: <Info aria-hidden />,
	info: <Info aria-hidden />,
	success: <CircleCheck aria-hidden />,
	warning: <TriangleAlert aria-hidden />,
	danger: <CircleAlert aria-hidden />,
};

export interface AlertProps
	extends Omit<ComponentProps<"div">, "color" | "title">,
		VariantProps<typeof alertStyles> {
	title?: ReactNode;
	description?: ReactNode;
	icon?: ReactNode;
	hideIcon?: boolean;
	/** Buttons or links rendered under the text. */
	actions?: ReactNode;
	onClose?: () => void;
	/** Defaults to `status`; use `alert` only for messages that must interrupt the reader. */
	role?: ComponentProps<"div">["role"];
}

/** Inline callout for status messages and validation summaries. */
export function Alert({
	variant,
	color = "neutral",
	title,
	description,
	icon,
	hideIcon,
	actions,
	onClose,
	role = "status",
	className,
	children,
	...props
}: AlertProps) {
	return (
		<div {...props} role={role} className={alertStyles({ variant, color, className })}>
			{hideIcon ? null : (icon ?? defaultIcons[color])}
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				{title ? <div className="font-medium">{title}</div> : null}
				{description ? <div className="opacity-90">{description}</div> : null}
				{children}
				{actions ? <div className="mt-2 flex items-center gap-2">{actions}</div> : null}
			</div>
			{onClose ? (
				<IconButton
					aria-label="Dismiss"
					size="xs"
					onPress={onClose}
					className="-mt-1 -mr-1.5 text-current opacity-70 hover:opacity-100"
				>
					<X />
				</IconButton>
			) : null}
		</div>
	);
}
