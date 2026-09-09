import type { ComponentProps, ReactNode } from "react";
import { Pressable } from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/focus-ring";
import { tv, type VariantProps } from "../utils/tv";

export const cardStyles = tv({
	extend: focusRing,
	base: "flex flex-col overflow-hidden text-foreground",
	variants: {
		variant: {
			outline: "border border-border bg-surface shadow-2xs",
			elevated: "bg-surface shadow-md",
			flat: "bg-surface-2",
			glass: "glass border",
			ghost: "",
		},
		radius: {
			md: "rounded-lg",
			lg: "rounded-xl",
			xl: "rounded-2xl",
			"2xl": "rounded-3xl",
		},
		isPressable: {
			true: "cursor-pointer transition-[box-shadow,transform,border-color] hover:border-border-strong hover:shadow-sm pressed:scale-[0.995]",
		},
	},
	defaultVariants: { variant: "outline", radius: "xl" },
});

export interface CardProps
	extends Omit<ComponentProps<"div">, "onClick">,
		VariantProps<typeof cardStyles> {
	onPress?: () => void;
}

/** White surface with a hairline border; the basic building block of every dashboard. */
export function Card({
	variant,
	radius,
	isPressable,
	onPress,
	className,
	children,
	...props
}: CardProps) {
	const pressable = isPressable ?? onPress != null;
	const cls = cardStyles({ variant, radius, isPressable: pressable, className });
	if (pressable) {
		return (
			<Pressable onPress={onPress}>
				{/* biome-ignore lint/a11y/useSemanticElements: a <button> cannot contain the nested links and buttons a card holds */}
				<div {...props} role="button" tabIndex={0} className={cls}>
					{children}
				</div>
			</Pressable>
		);
	}
	return (
		<div {...props} className={cls}>
			{children}
		</div>
	);
}

export interface CardSectionProps extends ComponentProps<"div"> {}

export function CardHeader({ className, ...props }: CardSectionProps) {
	return (
		<div
			{...props}
			className={cn("flex items-start justify-between gap-4 px-5 pt-5 pb-3", className)}
		/>
	);
}

export function CardBody({ className, ...props }: CardSectionProps) {
	return <div {...props} className={cn("flex-1 px-5 py-3", className)} />;
}

export function CardFooter({ className, ...props }: CardSectionProps) {
	return <div {...props} className={cn("flex items-center gap-3 px-5 pt-3 pb-5", className)} />;
}

export interface CardTitleProps extends ComponentProps<"h3"> {
	description?: ReactNode;
}

export function CardTitle({ description, className, children, ...props }: CardTitleProps) {
	return (
		<div className="min-w-0">
			<h3 {...props} className={cn("truncate font-semibold text-base text-foreground", className)}>
				{children}
			</h3>
			{description ? <p className="mt-0.5 text-muted text-sm">{description}</p> : null}
		</div>
	);
}
