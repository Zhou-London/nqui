import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import { cn } from "../utils/cn";
import { Button } from "./button";

export interface PaginationProps {
	page: number;
	total: number;
	onChange: (page: number) => void;
	/** Pages shown on each side of the current one. */
	siblings?: number;
	size?: "sm" | "md";
	showControls?: boolean;
	className?: string;
}

function range(start: number, end: number): number[] {
	return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function paginationItems(page: number, total: number, siblings = 1): (number | "…")[] {
	const totalSlots = siblings * 2 + 5;
	if (total <= totalSlots) return range(1, total);
	const left = Math.max(page - siblings, 1);
	const right = Math.min(page + siblings, total);
	const showLeftDots = left > 2;
	const showRightDots = right < total - 1;
	if (!showLeftDots && showRightDots) return [...range(1, siblings * 2 + 3), "…", total];
	if (showLeftDots && !showRightDots) return [1, "…", ...range(total - (siblings * 2 + 2), total)];
	return [1, "…", ...range(left, right), "…", total];
}

/** Hidden below `sm`, where only the arrows and the current page remain. */
const ellipsisClass = "flex size-8 items-center justify-center text-subtle max-sm:hidden";

/** Numbered page switcher with ellipses. */
export function Pagination({
	page,
	total,
	onChange,
	siblings = 1,
	size = "sm",
	showControls = true,
	className,
}: PaginationProps) {
	const items = paginationItems(page, total, siblings);
	return (
		<nav aria-label="Pagination" className={cn("flex items-center gap-1", className)}>
			{showControls ? (
				<Button
					aria-label="Previous page"
					variant="ghost"
					color="neutral"
					size={size}
					isIconOnly
					isDisabled={page <= 1}
					onPress={() => onChange(page - 1)}
				>
					<ChevronLeft />
				</Button>
			) : null}
			{items.map((item, i) =>
				item === "…" ? (
					// biome-ignore lint/suspicious/noArrayIndexKey: ellipses are positional
					<span key={`e${i}`} className={ellipsisClass}>
						<Ellipsis className="size-4" />
					</span>
				) : (
					<Button
						key={item}
						size={size}
						isIconOnly
						variant={item === page ? "solid" : "ghost"}
						color={item === page ? "accent" : "neutral"}
						aria-current={item === page ? "page" : undefined}
						aria-label={`Page ${item}`}
						onPress={() => onChange(item)}
						// Below `sm` only the current page stays between the arrows.
						className={cn("numeric", item !== page && "max-sm:hidden")}
					>
						{item}
					</Button>
				),
			)}
			{showControls ? (
				<Button
					aria-label="Next page"
					variant="ghost"
					color="neutral"
					size={size}
					isIconOnly
					isDisabled={page >= total}
					onPress={() => onChange(page + 1)}
				>
					<ChevronRight />
				</Button>
			) : null}
		</nav>
	);
}
