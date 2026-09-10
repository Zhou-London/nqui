import type { ComponentProps, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface EmptyStateProps extends Omit<ComponentProps<"div">, "title"> {
	icon?: ReactNode;
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
	size?: "sm" | "md" | "lg";
}

/** Centered placeholder for empty lists, tables, and search results. */
export function EmptyState({
	icon,
	title,
	description,
	actions,
	size = "md",
	className,
	...props
}: EmptyStateProps) {
	return (
		<div
			{...props}
			className={cn(
				"flex flex-col items-center justify-center text-center",
				size === "sm" ? "gap-2 py-6" : size === "lg" ? "gap-4 py-16" : "gap-4 py-12",
				className,
			)}
		>
			{icon ? (
				<div className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted [&_svg]:size-6">
					{icon}
				</div>
			) : null}
			<div className="flex flex-col gap-1">
				<div className={cn("font-medium text-foreground", size === "lg" ? "text-base" : "text-sm")}>
					{title}
				</div>
				{description ? <div className="max-w-sm text-muted text-sm">{description}</div> : null}
			</div>
			{actions ? <div className="mt-1 flex items-center gap-2">{actions}</div> : null}
		</div>
	);
}
