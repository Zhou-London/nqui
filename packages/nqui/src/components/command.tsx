"use client";

import { Search } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import {
	Menu as AriaMenu,
	type MenuProps as AriaMenuProps,
	Autocomplete,
	Input,
	SearchField,
	useFilter,
} from "react-aria-components";
import { useMessages } from "../i18n/use-messages";
import { cn } from "../utils/cn";
import { Dialog, Modal } from "./dialog";
import { Kbd } from "./kbd";
import { MenuItem, MenuSection, MenuSeparator } from "./menu";

export interface CommandPaletteProps<T extends object> extends Omit<AriaMenuProps<T>, "className"> {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	placeholder?: string;
	/** Footer hint content; defaults to the standard key legend. */
	footer?: ReactNode;
	className?: string;
}

/**
 * Spotlight-style launcher: a search field that filters a menu of commands. Use
 * `MenuItem`, `MenuSection`, and `MenuSeparator` for the children.
 */
export function CommandPalette<T extends object>({
	isOpen,
	onOpenChange,
	placeholder,
	footer,
	className,
	onAction,
	children,
	...menuProps
}: CommandPaletteProps<T>) {
	const { contains } = useFilter({ sensitivity: "base" });
	const m = useMessages();
	// The dialog takes focus for itself when it opens, so the search box asks for it back on
	// the next frame; Escape and typing then work at once.
	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (!isOpen) return;
		const frame = requestAnimationFrame(() => inputRef.current?.focus());
		return () => cancelAnimationFrame(frame);
	}, [isOpen]);
	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			size="lg"
			className={cn("max-w-xl max-sm:rounded-none", className)}
			overlayClassName="items-start pt-[14vh] sm:pt-[14vh]"
		>
			<Dialog aria-label={m.commandPalette}>
				<Autocomplete filter={contains}>
					<SearchField
						aria-label={m.commandSearch}
						autoFocus
						className="flex h-12 items-center gap-2 border-border border-b px-4 [&_button]:hidden"
					>
						<Search aria-hidden className="size-4 shrink-0 text-muted" />
						<Input
							ref={inputRef}
							placeholder={placeholder ?? m.commandPlaceholder}
							className="min-w-0 flex-1 bg-transparent text-foreground text-sm outline-hidden placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
						/>
						<Kbd size="sm">esc</Kbd>
					</SearchField>
					<AriaMenu
						{...menuProps}
						onAction={(key, value) => {
							onAction?.(key, value);
							onOpenChange(false);
						}}
						renderEmptyState={() => (
							<div className="px-4 py-8 text-center text-muted text-sm">{m.noResults}</div>
						)}
						className="max-h-[50vh] overflow-auto p-1 outline-hidden"
					>
						{children}
					</AriaMenu>
				</Autocomplete>
				<div className="flex items-center gap-4 border-border border-t px-4 py-2 text-muted text-xs">
					{footer ?? (
						<>
							<span className="flex items-center gap-1">
								<Kbd size="sm" keys={["up"]} /> <Kbd size="sm" keys={["down"]} />{" "}
								{m.commandNavigate}
							</span>
							<span className="flex items-center gap-1">
								<Kbd size="sm" keys={["enter"]} /> {m.commandSelect}
							</span>
						</>
					)}
				</div>
			</Dialog>
		</Modal>
	);
}

export {
	MenuItem as CommandItem,
	MenuSection as CommandSection,
	MenuSeparator as CommandSeparator,
};

/**
 * Bind a global shortcut (default ⌘K / Ctrl+K) that toggles the palette. A keystroke that an
 * editor or field already handled (and called `preventDefault()` on) is left alone.
 */
export function useCommandShortcut(onToggle: () => void, key = "k"): void {
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			// Autofill dispatches keydown events without a `key`; IME composition is not a shortcut.
			if (e.defaultPrevented || e.isComposing || typeof e.key !== "string") return;
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key.toLowerCase()) {
				e.preventDefault();
				onToggle();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onToggle, key]);
}
