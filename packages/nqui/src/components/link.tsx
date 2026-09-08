import {
	Link as AriaLink,
	type LinkProps as AriaLinkProps,
	composeRenderProps,
} from "react-aria-components";
import { focusRing } from "../utils/focus-ring";
import { tv, type VariantProps } from "../utils/tv";

export const linkStyles = tv({
	extend: focusRing,
	base: "inline-flex cursor-pointer items-center gap-1 rounded-xs underline-offset-4 transition-colors disabled:cursor-default disabled:opacity-45 [&_svg]:size-[1em]",
	variants: {
		variant: {
			primary: "text-primary-text hover:underline",
			foreground: "text-foreground hover:text-primary-text",
			muted: "text-muted hover:text-foreground",
			underline: "text-foreground underline decoration-border hover:decoration-foreground",
		},
	},
	defaultVariants: { variant: "primary" },
});

export interface LinkProps
	extends Omit<AriaLinkProps, "className">,
		VariantProps<typeof linkStyles> {
	className?: AriaLinkProps["className"];
}

/** Anchor that also works as a client-side route link through `RouterProvider`. */
export function Link({ variant, className, ...props }: LinkProps) {
	return (
		<AriaLink
			{...props}
			className={composeRenderProps(className, (cls, rp) =>
				linkStyles({ ...rp, variant, className: cls }),
			)}
		/>
	);
}
