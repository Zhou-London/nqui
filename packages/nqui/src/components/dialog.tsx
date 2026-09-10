import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import {
	Dialog as AriaDialog,
	type DialogProps as AriaDialogProps,
	Modal as AriaModal,
	composeRenderProps,
	DialogTrigger,
	Heading,
	ModalOverlay,
	type ModalOverlayProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { tv, type VariantProps } from "../utils/tv";
import { IconButton } from "./button";

export const overlayStyles = tv({
	base: [
		"fixed inset-0 z-50 flex min-h-full items-center justify-center bg-overlay p-4 backdrop-blur-[2px]",
		"entering:animate-fade-in exiting:animate-fade-out",
	],
});

export const modalStyles = tv({
	base: [
		"relative max-h-[calc(100dvh-2rem)] w-full overflow-hidden rounded-2xl border border-border bg-surface text-foreground shadow-xl",
		"entering:animate-zoom-in exiting:animate-zoom-out",
	],
	variants: {
		size: {
			xs: "max-w-xs",
			sm: "max-w-sm",
			md: "max-w-lg",
			lg: "max-w-2xl",
			xl: "max-w-4xl",
			full: "h-full max-w-none rounded-none",
		},
	},
	defaultVariants: { size: "md" },
});

export interface ModalProps
	extends Omit<ModalOverlayProps, "className">,
		VariantProps<typeof modalStyles> {
	className?: string;
	overlayClassName?: string;
}

/** Centered modal window. Wrap the content in `Dialog` and place a `DialogTrigger` around the pair. */
export function Modal({
	size,
	className,
	overlayClassName,
	isDismissable = true,
	children,
	...props
}: ModalProps) {
	return (
		<ModalOverlay
			{...props}
			isDismissable={isDismissable}
			className={composeRenderProps(overlayClassName, (cls) => overlayStyles({ className: cls }))}
		>
			<AriaModal
				className={composeRenderProps(className, (cls) => modalStyles({ size, className: cls }))}
			>
				{children}
			</AriaModal>
		</ModalOverlay>
	);
}

export interface DialogProps extends AriaDialogProps {}

/** Accessible dialog surface used inside `Modal`, `Drawer`, and `Popover`. */
export function Dialog({ className, ...props }: DialogProps) {
	return (
		<AriaDialog
			{...props}
			className={cn("relative flex max-h-[inherit] flex-col outline-hidden", className)}
		/>
	);
}

export interface DialogHeaderProps extends Omit<ComponentProps<"div">, "title"> {
	title?: ReactNode;
	description?: ReactNode;
	/** Renders an X button that closes the dialog. */
	showClose?: boolean;
	onClose?: () => void;
}

export function DialogHeader({
	title,
	description,
	showClose,
	onClose,
	className,
	children,
	...props
}: DialogHeaderProps) {
	return (
		<div
			{...props}
			className={cn("flex items-start justify-between gap-4 px-6 pt-6 pb-2", className)}
		>
			<div className="min-w-0 flex-1">
				{title ? (
					<Heading slot="title" className="font-semibold text-foreground text-lg leading-tight">
						{title}
					</Heading>
				) : null}
				{description ? <p className="mt-1 text-muted text-sm">{description}</p> : null}
				{children}
			</div>
			{showClose ? (
				<IconButton
					aria-label="Close"
					size="sm"
					slot="close"
					onPress={onClose}
					className="-mt-1 -mr-2"
				>
					<X />
				</IconButton>
			) : null}
		</div>
	);
}

export function DialogBody({ className, ...props }: ComponentProps<"div">) {
	return <div {...props} className={cn("flex-1 overflow-y-auto px-6 py-4 text-sm", className)} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={cn("flex items-center justify-end gap-2 px-6 pt-2 pb-6", className)}
		/>
	);
}

export { DialogTrigger };
