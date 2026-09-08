import { type ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";

export interface ScrollShadowProps extends ComponentProps<"div"> {
	orientation?: "vertical" | "horizontal";
	/** Fade size in pixels. */
	size?: number;
	/** Hide the native scrollbar. */
	hideScrollBar?: boolean;
}

/** Scroll container that fades its edges while more content is hidden in that direction. */
export function ScrollShadow({
	orientation = "vertical",
	size = 32,
	hideScrollBar,
	className,
	style,
	children,
	...props
}: ScrollShadowProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [edges, setEdges] = useState({ start: false, end: false });

	const update = useCallback(() => {
		const el = ref.current;
		if (!el) return;
		const start = orientation === "vertical" ? el.scrollTop : el.scrollLeft;
		const max =
			orientation === "vertical"
				? el.scrollHeight - el.clientHeight
				: el.scrollWidth - el.clientWidth;
		setEdges({ start: start > 1, end: max - start > 1 });
	}, [orientation]);

	useEffect(() => {
		update();
		const el = ref.current;
		if (!el) return;
		const ro = new ResizeObserver(update);
		ro.observe(el);
		for (const child of Array.from(el.children)) ro.observe(child);
		return () => ro.disconnect();
	}, [update]);

	const dir = orientation === "vertical" ? "to bottom" : "to right";
	const from = edges.start ? `transparent 0, black ${size}px` : "black 0";
	const to = edges.end ? `black calc(100% - ${size}px), transparent 100%` : "black 100%";
	const mask = `linear-gradient(${dir}, ${from}, ${to})`;

	return (
		<div
			{...props}
			ref={ref}
			onScroll={(e) => {
				update();
				props.onScroll?.(e);
			}}
			className={cn(
				orientation === "vertical" ? "overflow-y-auto" : "overflow-x-auto",
				hideScrollBar && "no-scrollbar",
				className,
			)}
			style={{ maskImage: mask, WebkitMaskImage: mask, ...style }}
		>
			{children}
		</div>
	);
}
