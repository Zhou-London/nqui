import type { ComponentProps } from "react";
import { Keyboard } from "react-aria-components";
import { cn } from "../utils/cn";

const symbols: Record<string, string> = {
	command: "⌘",
	cmd: "⌘",
	meta: "⌘",
	shift: "⇧",
	ctrl: "⌃",
	control: "⌃",
	option: "⌥",
	alt: "⌥",
	enter: "↵",
	return: "↵",
	delete: "⌫",
	backspace: "⌫",
	escape: "⎋",
	esc: "⎋",
	tab: "⇥",
	up: "↑",
	down: "↓",
	left: "←",
	right: "→",
	space: "␣",
};

export interface KbdProps extends ComponentProps<"kbd"> {
	/** Modifier keys rendered before the children, e.g. ["cmd", "shift"]. */
	keys?: string[];
	size?: "sm" | "md";
}

/** Keyboard shortcut hint, e.g. `<Kbd keys={["cmd"]}>K</Kbd>`. */
export function Kbd({ keys = [], size = "md", className, children, ...props }: KbdProps) {
	return (
		<Keyboard>
			<kbd
				{...props}
				className={cn(
					"inline-flex select-none items-center gap-0.5 rounded-md border border-border bg-surface-2 px-1.5 font-medium font-sans text-muted shadow-2xs",
					size === "sm" ? "h-5 text-2xs" : "h-6 text-xs",
					className,
				)}
			>
				{keys.map((k) => (
					<span key={k}>{symbols[k.toLowerCase()] ?? k}</span>
				))}
				{children}
			</kbd>
		</Keyboard>
	);
}

export interface CodeProps extends ComponentProps<"code"> {
	color?: "neutral" | "primary" | "danger";
}

const codeColor = {
	neutral: "bg-surface-2 text-foreground",
	primary: "bg-primary-soft text-primary-text",
	danger: "bg-danger-soft text-danger-text",
};

/** Inline code span. */
export function Code({ color = "neutral", className, ...props }: CodeProps) {
	return (
		<code
			{...props}
			className={cn(
				"rounded-md px-1.5 py-0.5 font-mono text-[0.875em]",
				codeColor[color],
				className,
			)}
		/>
	);
}
