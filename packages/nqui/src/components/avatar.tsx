import {
	Children,
	type ComponentProps,
	cloneElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
	useState,
} from "react";
import { cn } from "../utils/cn";
import { tv, type VariantProps } from "../utils/tv";

export const avatarStyles = tv({
	base: "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden bg-surface-2 align-middle font-medium text-foreground",
	variants: {
		size: {
			xs: "size-6 text-2xs",
			sm: "size-8 text-xs",
			md: "size-10 text-sm",
			lg: "size-12 text-base",
			xl: "size-16 text-lg",
		},
		radius: {
			md: "rounded-lg",
			lg: "rounded-xl",
			full: "rounded-full",
		},
		isBordered: {
			true: "ring-2 ring-surface ring-offset-1 ring-offset-border",
		},
	},
	defaultVariants: { size: "md", radius: "full" },
});

export interface AvatarProps
	extends Omit<ComponentProps<"span">, "children">,
		VariantProps<typeof avatarStyles> {
	src?: string;
	alt?: string;
	/** Used for initials and to seed the gradient fallback. */
	name?: string;
	/** Custom fallback when there is no image and no name. */
	fallback?: ReactNode;
	/** Small status dot in the corner. */
	status?: "online" | "away" | "busy" | "offline";
}

function hash(input: string): number {
	let h = 2166136261;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

const gradientStops = [
	"var(--nq-primary-500)",
	"var(--nq-info-500)",
	"var(--nq-success-500)",
	"var(--nq-warning-500)",
	"var(--nq-danger-500)",
	"var(--nq-chart-1)",
	"var(--nq-chart-2)",
	"var(--nq-chart-3)",
	"var(--nq-chart-4)",
	"var(--nq-chart-5)",
];

/**
 * Deterministic soft gradient so users without photos still look distinct. Built from the
 * theme's own `--nq-*` colors so it follows light and dark mode.
 */
export function gradientFor(seed: string): string {
	const h = hash(seed);
	const n = gradientStops.length;
	const a = gradientStops[h % n];
	const b = gradientStops[(h + 1 + ((h >> 8) % (n - 1))) % n];
	const mix = 55 + (h % 30);
	return `linear-gradient(135deg, color-mix(in oklab, ${a} ${mix}%, var(--nq-surface)) 0%, color-mix(in oklab, ${b} ${mix}%, var(--nq-surface)) 100%)`;
}

export function initialsOf(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "";
	if (parts.length === 1) return (parts[0] as string).slice(0, 2).toUpperCase();
	return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
}

const statusColor = {
	online: "bg-success",
	away: "bg-warning",
	busy: "bg-danger",
	offline: "bg-subtle",
};

export function Avatar({
	src,
	alt,
	name,
	fallback,
	status,
	size,
	radius,
	isBordered,
	className,
	style,
	...props
}: AvatarProps) {
	const [failed, setFailed] = useState(false);
	const showImage = Boolean(src) && !failed;
	const seed = name ?? alt ?? src ?? "nqui";
	const label = alt ?? name;
	// Only an avatar with a name is an image to assistive tech; a bare fallback is decoration.
	const imageRole = label ? { role: "img", "aria-label": label } : {};
	return (
		<span
			{...props}
			{...imageRole}
			className={avatarStyles({ size, radius, isBordered, className })}
			style={showImage ? style : { backgroundImage: gradientFor(seed), ...style }}
		>
			{showImage ? (
				<img src={src} alt="" className="size-full object-cover" onError={() => setFailed(true)} />
			) : name ? (
				<span className="text-accent-foreground drop-shadow-xs">{initialsOf(name)}</span>
			) : (
				fallback
			)}
			{status ? (
				<span
					aria-hidden
					className={cn(
						"absolute right-0 bottom-0 size-[28%] rounded-full ring-2 ring-surface",
						statusColor[status],
					)}
				/>
			) : null}
		</span>
	);
}

export interface AvatarGroupProps extends ComponentProps<"div"> {
	/** Show at most this many avatars, then a "+N" bubble. */
	max?: number;
	size?: AvatarProps["size"];
	/** Number of avatars in total, used when children are already truncated. */
	total?: number;
}

function isAvatarElement(node: ReactNode): node is ReactElement<AvatarProps> {
	return isValidElement(node) && node.type === Avatar;
}

/** Overlapping stack of avatars, as seen on task cards and member lists. */
export function AvatarGroup({
	max = 4,
	size = "sm",
	total,
	className,
	children,
	...props
}: AvatarGroupProps) {
	const items = Children.toArray(children);
	const visible = items.slice(0, max);
	const remaining = (total ?? items.length) - visible.length;
	return (
		<div {...props} className={cn("-space-x-2 flex items-center", className)}>
			{visible.map((child, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: avatars are positional
				<span key={i} className="rounded-full ring-2 ring-surface">
					{isAvatarElement(child) && child.props.size == null
						? cloneElement(child, { size })
						: child}
				</span>
			))}
			{remaining > 0 ? (
				<Avatar
					size={size}
					name={undefined}
					fallback={<span className="text-muted">+{remaining}</span>}
					className="ring-2 ring-surface"
					style={{ backgroundImage: "none" }}
				/>
			) : null}
		</div>
	);
}
