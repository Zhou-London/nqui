import { type ComponentProps, type ReactNode, useState } from "react";
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

/** Deterministic soft gradient so users without photos still look distinct. */
export function gradientFor(seed: string): string {
	const h = hash(seed);
	const a = h % 360;
	const b = (a + 40 + (h % 80)) % 360;
	const c = (b + 60 + ((h >> 8) % 60)) % 360;
	return `linear-gradient(135deg, oklch(0.8 0.14 ${a}) 0%, oklch(0.72 0.17 ${b}) 55%, oklch(0.78 0.15 ${c}) 100%)`;
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
	return (
		<span
			{...props}
			role="img"
			aria-label={alt ?? name}
			className={avatarStyles({ size, radius, isBordered, className })}
			style={showImage ? style : { backgroundImage: gradientFor(seed), ...style }}
		>
			{showImage ? (
				<img src={src} alt="" className="size-full object-cover" onError={() => setFailed(true)} />
			) : name ? (
				<span className="text-white drop-shadow-xs">{initialsOf(name)}</span>
			) : (
				fallback
			)}
			{status ? (
				<span
					aria-hidden
					className={`absolute right-0 bottom-0 size-[28%] rounded-full ring-2 ring-surface ${statusColor[status]}`}
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

/** Overlapping stack of avatars, as seen on task cards and member lists. */
export function AvatarGroup({
	max = 4,
	size = "sm",
	total,
	className,
	children,
	...props
}: AvatarGroupProps) {
	const items = Array.isArray(children) ? children.flat() : [children];
	const visible = items.slice(0, max);
	const remaining = (total ?? items.length) - visible.length;
	return (
		<div {...props} className={`flex items-center -space-x-2 ${className ?? ""}`}>
			{visible.map((child, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: avatars are positional
				<span key={i} className="rounded-full ring-2 ring-surface">
					{child}
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
