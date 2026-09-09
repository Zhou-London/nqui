import type { ReactNode } from "react";
import {
	Modal as AriaModal,
	composeRenderProps,
	ModalOverlay,
	type ModalOverlayProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { tv, type VariantProps } from "../utils/tv";
import { overlayStyles } from "./dialog";

export const drawerStyles = tv({
	base: "fixed z-50 flex flex-col border-border bg-surface text-foreground shadow-xl",
	variants: {
		placement: {
			right:
				"inset-y-0 right-0 h-full w-full max-w-md border-l entering:animate-slide-in-right exiting:animate-slide-out-right",
			left: "inset-y-0 left-0 h-full w-full max-w-md border-r entering:animate-slide-in-left exiting:animate-slide-out-left",
			bottom:
				"inset-x-0 bottom-0 max-h-[92dvh] w-full rounded-t-3xl border-t entering:animate-slide-in-bottom exiting:animate-slide-out-bottom",
			top: "inset-x-0 top-0 max-h-[92dvh] w-full rounded-b-3xl border-b entering:animate-slide-in-top exiting:animate-slide-out-top",
		},
		size: {
			sm: "",
			md: "",
			lg: "",
			xl: "",
		},
	},
	compoundVariants: [
		{ placement: ["left", "right"], size: "sm", class: "max-w-xs" },
		{ placement: ["left", "right"], size: "md", class: "max-w-md" },
		{ placement: ["left", "right"], size: "lg", class: "max-w-xl" },
		{ placement: ["left", "right"], size: "xl", class: "max-w-3xl" },
		{ placement: ["top", "bottom"], size: "sm", class: "max-h-[40dvh]" },
		{ placement: ["top", "bottom"], size: "md", class: "max-h-[60dvh]" },
		{ placement: ["top", "bottom"], size: "lg", class: "max-h-[80dvh]" },
		{ placement: ["top", "bottom"], size: "xl", class: "max-h-[92dvh]" },
	],
	defaultVariants: { placement: "right", size: "md" },
});

export interface DrawerProps
	extends Omit<ModalOverlayProps, "className" | "children">,
		VariantProps<typeof drawerStyles> {
	className?: ModalOverlayProps["className"];
	/** Classes for the backdrop, e.g. to change its tint. */
	overlayClassName?: string;
	children?: ReactNode;
}

/**
 * Panel that slides in from an edge. `placement="bottom"` gives the mobile sheet with a
 * grab handle; wrap the content in `Dialog`.
 */
export function Drawer({
	placement = "right",
	size,
	className,
	overlayClassName,
	isDismissable = true,
	children,
	...props
}: DrawerProps) {
	return (
		<ModalOverlay
			{...props}
			isDismissable={isDismissable}
			className={overlayStyles({
				className: cn("items-stretch justify-stretch p-0", overlayClassName),
			})}
		>
			<AriaModal
				className={composeRenderProps(className, (cls) =>
					drawerStyles({ placement, size, className: cls }),
				)}
			>
				{placement === "bottom" ? (
					<div
						aria-hidden
						className="mx-auto mt-2 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-surface-3"
					/>
				) : null}
				{children}
			</AriaModal>
		</ModalOverlay>
	);
}
