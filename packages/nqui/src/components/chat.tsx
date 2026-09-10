import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { tv } from "../utils/tv";
import { IconButton, type IconButtonProps } from "./button";
import { Tooltip, TooltipTrigger } from "./tooltip";

export type ChatRole = "user" | "assistant";
export type ChatFeedback = "up" | "down";

export interface ChatProps extends ComponentProps<"div"> {
	/** Text size of the transcript; `md` is 16 px, `sm` is 14 px. */
	size?: "sm" | "md";
}

/** Transcript container: stacks `ChatMessage`s and announces new ones to assistive tech. */
export function Chat({ size = "md", className, ...props }: ChatProps) {
	return (
		<div
			role="log"
			{...props}
			data-size={size}
			className={cn(
				"flex flex-col gap-6 text-foreground",
				size === "sm" ? "text-sm" : "text-base",
				className,
			)}
		/>
	);
}

/** The user's message surface: a tinted pill that hugs its text. */
export const chatBubbleStyles = tv({
	base: "inline-block max-w-[85%] wrap-break-word rounded-3xl bg-surface-2 px-4 py-2 text-foreground",
});

export function ChatBubble({ className, ...props }: ComponentProps<"div">) {
	return <div {...props} className={chatBubbleStyles({ className })} />;
}

/** Small neutral avatar for the assistant; pass initials or an icon as children. */
export function ChatAvatar({ className, ...props }: ComponentProps<"span">) {
	return (
		<span
			aria-hidden
			{...props}
			className={cn(
				"flex size-8 shrink-0 select-none items-center justify-center rounded-full bg-surface-2 font-medium text-foreground text-xs",
				className,
			)}
		/>
	);
}

export interface ChatMessageProps extends ComponentProps<"div"> {
	/** `user` renders a right-aligned bubble; `assistant` renders avatar plus plain text. */
	from?: ChatRole;
	/** Leading avatar for assistant messages: a `ChatAvatar` or an `Avatar`. */
	avatar?: ReactNode;
	/** Sender name above the content. */
	name?: ReactNode;
	/** Row under the content, usually `ChatActions`. */
	actions?: ReactNode;
	/** Streaming: appends a blinking cursor after the content. */
	isPending?: boolean;
	children?: ReactNode;
}

export function ChatMessage({
	from = "assistant",
	avatar,
	name,
	actions,
	isPending,
	className,
	children,
	...props
}: ChatMessageProps) {
	const cursor = isPending ? (
		<span
			aria-hidden
			className="ml-1 inline-block h-4 w-2 animate-blink rounded-xs bg-foreground align-middle"
		/>
	) : null;
	if (from === "user") {
		return (
			<div {...props} data-from="user" className={cn("flex flex-col items-end gap-2", className)}>
				<ChatBubble>
					{children}
					{cursor}
				</ChatBubble>
				{actions}
			</div>
		);
	}
	return (
		<div {...props} data-from="assistant" className={cn("flex items-start gap-4", className)}>
			{avatar}
			<div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
				{name ? <span className="font-medium text-sm">{name}</span> : null}
				<div className="min-w-0 wrap-break-word">
					{children}
					{cursor}
				</div>
				{actions}
			</div>
		</div>
	);
}

export interface ChatActionProps extends Omit<IconButtonProps, "aria-label" | "children"> {
	/** Tooltip text and accessible name. */
	label: string;
	icon: ReactNode;
	/** Toggle state for rating actions. */
	isActive?: boolean;
}

/** One icon action with a tooltip; `ChatActions` composes these. */
export function ChatAction({ label, icon, isActive, className, ...props }: ChatActionProps) {
	return (
		<TooltipTrigger>
			<IconButton
				size="xs"
				{...props}
				aria-label={label}
				aria-pressed={isActive}
				className={cn(
					"text-muted hover:text-foreground",
					isActive && "bg-accent-soft text-foreground",
					className,
				)}
			>
				{icon}
			</IconButton>
			<Tooltip>{label}</Tooltip>
		</TooltipTrigger>
	);
}

export interface ChatActionsProps extends ComponentProps<"div"> {
	/** Text the copy action puts on the clipboard; omit to hide the action. */
	copyText?: string;
	onCopy?: () => void;
	/** Current rating; `null` clears it. Omit `onFeedbackChange` to hide the thumbs. */
	feedback?: ChatFeedback | null;
	defaultFeedback?: ChatFeedback | null;
	onFeedbackChange?: (feedback: ChatFeedback | null) => void;
	/** Omit to hide the regenerate action. */
	onRegenerate?: () => void;
	/** Extra `ChatAction`s appended after the built-in ones. */
	children?: ReactNode;
}

/** Copy, rate, and regenerate row shown under an assistant message. */
export function ChatActions({
	copyText,
	onCopy,
	feedback: feedbackProp,
	defaultFeedback = null,
	onFeedbackChange,
	onRegenerate,
	className,
	children,
	...props
}: ChatActionsProps) {
	const [copied, setCopied] = useState(false);
	const copiedTimer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(copiedTimer.current), []);
	const [innerFeedback, setInnerFeedback] = useState<ChatFeedback | null>(defaultFeedback);
	const feedback = feedbackProp !== undefined ? feedbackProp : innerFeedback;

	const copy = async () => {
		if (copyText === undefined) return;
		try {
			await navigator.clipboard.writeText(copyText);
			onCopy?.();
			setCopied(true);
			window.clearTimeout(copiedTimer.current);
			copiedTimer.current = window.setTimeout(() => setCopied(false), 1500);
		} catch {
			// Clipboard blocked; nothing else to do.
		}
	};
	const rate = (value: ChatFeedback) => {
		const next = feedback === value ? null : value;
		setInnerFeedback(next);
		onFeedbackChange?.(next);
	};

	return (
		<div {...props} className={cn("flex items-center gap-2", className)}>
			{copyText !== undefined ? (
				<ChatAction
					label={copied ? "Copied" : "Copy"}
					icon={copied ? <Check /> : <Copy />}
					onPress={copy}
				/>
			) : null}
			{onFeedbackChange ? (
				<>
					<ChatAction
						label="Good response"
						icon={<ThumbsUp />}
						isActive={feedback === "up"}
						onPress={() => rate("up")}
					/>
					<ChatAction
						label="Bad response"
						icon={<ThumbsDown />}
						isActive={feedback === "down"}
						onPress={() => rate("down")}
					/>
				</>
			) : null}
			{onRegenerate ? (
				<ChatAction label="Regenerate" icon={<RefreshCw />} onPress={onRegenerate} />
			) : null}
			{children}
		</div>
	);
}
