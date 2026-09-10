import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";
import {
	UNSTABLE_Toast as AriaToast,
	UNSTABLE_ToastContent as AriaToastContent,
	UNSTABLE_ToastQueue as AriaToastQueue,
	UNSTABLE_ToastRegion as AriaToastRegion,
	Button,
	Text,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { tv } from "../utils/tv";

export type ToastColor = "neutral" | "success" | "info" | "warning" | "danger";
/** @deprecated Use `ToastColor`. */
export type ToastVariant = ToastColor;

export interface ToastContent {
	title: ReactNode;
	description?: ReactNode;
	color?: ToastColor;
	/** @deprecated Use `color`. */
	variant?: ToastColor;
	/** Optional action button. */
	action?: { label: string; onPress: () => void };
}

export interface ToastOptions {
	/** Milliseconds before auto-dismiss. Omit for a persistent toast. */
	timeout?: number;
	onClose?: () => void;
	/** Optional action button shown under the description. */
	action?: ToastContent["action"];
}

/** The single global queue. Render one `ToastRegion` near the root to show it. */
export const toastQueue = new AriaToastQueue<ToastContent>({
	maxVisibleToasts: 5,
	wrapUpdate(fn) {
		if (typeof document !== "undefined" && "startViewTransition" in document) {
			// A new transition aborts any in-flight one; that rejection is expected, not an error.
			const transition = document.startViewTransition(() => fn());
			transition.finished.catch(() => {});
			transition.ready.catch(() => {});
			transition.updateCallbackDone.catch(() => {});
		} else {
			fn();
		}
	},
});

function push(content: ToastContent, options?: ToastOptions): string {
	const { action, ...rest } = options ?? {};
	return toastQueue.add(action ? { ...content, action } : content, { timeout: 6000, ...rest });
}

/** Imperative toast API: `toast.success("Saved")`. */
export const toast = {
	show: push,
	neutral: (title: ReactNode, description?: ReactNode, options?: ToastOptions) =>
		push({ title, description, color: "neutral" }, options),
	success: (title: ReactNode, description?: ReactNode, options?: ToastOptions) =>
		push({ title, description, color: "success" }, options),
	info: (title: ReactNode, description?: ReactNode, options?: ToastOptions) =>
		push({ title, description, color: "info" }, options),
	warning: (title: ReactNode, description?: ReactNode, options?: ToastOptions) =>
		push({ title, description, color: "warning" }, options),
	danger: (title: ReactNode, description?: ReactNode, options?: ToastOptions) =>
		push({ title, description, color: "danger" }, options),
	close: (key: string) => toastQueue.close(key),
	/** Dismiss every toast, including those still waiting in the queue. */
	clear: () => toastQueue.clear(),
};

const icons: Record<ToastColor, ReactNode> = {
	neutral: <Info className="text-muted" />,
	success: <CircleCheck className="text-success" />,
	info: <Info className="text-info" />,
	warning: <TriangleAlert className="text-warning" />,
	danger: <CircleAlert className="text-danger" />,
};

const toastStyles = tv({
	base: [
		"pointer-events-auto flex w-[min(24rem,calc(100vw-2rem))] items-start gap-2 rounded-xl border border-border bg-surface p-4 text-foreground shadow-lg",
		"animate-slide-in-bottom [view-transition-class:nq-toast]",
		"[&_svg]:size-5 [&_svg]:shrink-0",
	],
});

export interface ToastRegionProps {
	/** Screen corner. */
	placement?:
		| "bottom-right"
		| "bottom-left"
		| "top-right"
		| "top-left"
		| "bottom-center"
		| "top-center";
	className?: string;
}

const placements = {
	"bottom-right": "right-4 bottom-4 items-end",
	"bottom-left": "left-4 bottom-4 items-start",
	"bottom-center": "inset-x-0 bottom-4 items-center",
	"top-right": "top-4 right-4 items-end flex-col-reverse",
	"top-left": "top-4 left-4 items-start flex-col-reverse",
	"top-center": "inset-x-0 top-4 items-center flex-col-reverse",
};

/** Renders queued toasts. Mount once, e.g. inside `NquiProvider`. */
export function ToastRegion({ placement = "bottom-right", className }: ToastRegionProps) {
	return (
		<AriaToastRegion
			queue={toastQueue}
			className={cn(
				"pointer-events-none fixed z-[100] flex flex-col gap-2 outline-hidden",
				placements[placement],
				className,
			)}
		>
			{({ toast: t }) => {
				const color = t.content.color ?? t.content.variant ?? "neutral";
				return (
					<AriaToast toast={t} className={toastStyles()} style={{ viewTransitionName: t.key }}>
						{icons[color]}
						<AriaToastContent className="flex min-w-0 flex-1 flex-col gap-1">
							<Text slot="title" className="font-medium text-sm">
								{t.content.title}
							</Text>
							{t.content.description ? (
								<Text slot="description" className="text-muted text-xs">
									{t.content.description}
								</Text>
							) : null}
							{t.content.action ? (
								<Button
									onPress={() => {
										t.content.action?.onPress();
										toastQueue.close(t.key);
									}}
									className="mt-2 w-fit font-medium text-primary-text text-xs outline-hidden hover:underline"
								>
									{t.content.action.label}
								</Button>
							) : null}
						</AriaToastContent>
						<Button
							slot="close"
							aria-label="Dismiss"
							className="-m-2 flex size-8 items-center justify-center rounded-md text-muted outline-hidden hover:bg-surface-2 hover:text-foreground"
						>
							<X />
						</Button>
					</AriaToast>
				);
			}}
		</AriaToastRegion>
	);
}
