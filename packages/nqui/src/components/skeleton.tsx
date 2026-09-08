import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

export interface SkeletonProps extends ComponentProps<"div"> {
	/** Render children invisibly to reserve their exact size. */
	isLoaded?: boolean;
}

/** Shimmering placeholder. Wrap content or give it explicit size classes. */
export function Skeleton({ isLoaded = false, className, children, ...props }: SkeletonProps) {
	if (isLoaded) return <>{children}</>;
	return (
		<div
			{...props}
			aria-busy="true"
			aria-live="polite"
			className={cn("shimmer rounded-lg", children ? "[&>*]:invisible" : "", className)}
		>
			{children}
		</div>
	);
}

export interface SkeletonTextProps extends ComponentProps<"div"> {
	lines?: number;
}

/** Several text-height bars, the last one shorter. */
export function SkeletonText({ lines = 3, className, ...props }: SkeletonTextProps) {
	return (
		<div {...props} className={cn("flex flex-col gap-2", className)}>
			{Array.from({ length: lines }, (_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: purely decorative rows
				<Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-3/5" : "w-full")} />
			))}
		</div>
	);
}
