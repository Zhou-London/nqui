import { Check, ChevronRight } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import {
	Menu as AriaMenu,
	MenuItem as AriaMenuItem,
	type MenuItemProps as AriaMenuItemProps,
	type MenuProps as AriaMenuProps,
	MenuSection as AriaMenuSection,
	type MenuSectionProps as AriaMenuSectionProps,
	Collection,
	composeRenderProps,
	Header,
	MenuTrigger,
	Separator,
	SubmenuTrigger,
	Text,
} from "react-aria-components";
import { tv } from "../utils/tv";
import { Kbd } from "./kbd";
import { listItemStyles } from "./listbox";
import { Popover, type PopoverProps } from "./popover";

export interface MenuProps<T extends object> extends Omit<AriaMenuProps<T>, "className"> {
	className?: string;
	/** Popover props, e.g. `placement="bottom end"`. */
	popoverProps?: Omit<PopoverProps, "children">;
}

/** Dropdown menu list. Wrap the trigger button and this in `MenuTrigger`. */
export function Menu<T extends object>({ className, popoverProps, ...props }: MenuProps<T>) {
	return (
		<Popover
			{...popoverProps}
			className={tv({ base: "min-w-48 max-w-xs" })({ className: popoverProps?.className })}
		>
			<AriaMenu
				{...props}
				className={composeRenderProps(className, (cls) =>
					tv({ base: "max-h-[inherit] overflow-auto p-1 outline-hidden" })({ className: cls }),
				)}
			/>
		</Popover>
	);
}

export interface MenuItemProps<T extends object = object>
	extends Omit<AriaMenuItemProps<T>, "className"> {
	className?: string;
	icon?: ReactNode;
	description?: ReactNode;
	/** Keyboard shortcut rendered at the end, e.g. ["cmd", "K"]. */
	shortcut?: string[];
	color?: "neutral" | "danger";
}

export function MenuItem<T extends object = object>({
	className,
	icon,
	description,
	shortcut,
	color,
	children,
	...props
}: MenuItemProps<T>) {
	const textValue = props.textValue ?? (typeof children === "string" ? children : undefined);
	return (
		<AriaMenuItem
			{...props}
			textValue={textValue}
			className={composeRenderProps(className, (cls, rp) =>
				listItemStyles({ ...rp, color, className: cls }),
			)}
		>
			{composeRenderProps(children, (content, { isSelected, selectionMode, hasSubmenu }) => (
				<>
					{selectionMode !== "none" ? (
						<Check aria-hidden className={isSelected ? "text-primary! opacity-100" : "opacity-0"} />
					) : null}
					{icon}
					<span className="flex min-w-0 flex-1 flex-col">
						<Text slot="label" className="truncate">
							{content}
						</Text>
						{description ? (
							<Text slot="description" className="truncate text-muted text-xs">
								{description}
							</Text>
						) : null}
					</span>
					{shortcut ? (
						<Kbd size="sm" keys={shortcut.slice(0, -1)}>
							{shortcut[shortcut.length - 1]}
						</Kbd>
					) : null}
					{hasSubmenu ? <ChevronRight aria-hidden /> : null}
				</>
			))}
		</AriaMenuItem>
	);
}

export interface MenuSectionProps<T extends object>
	extends Omit<AriaMenuSectionProps<T>, "children"> {
	title?: ReactNode;
	items?: Iterable<T>;
	children: ReactNode | ((item: T) => ReactElement);
}

export function MenuSection<T extends object>({
	title,
	items,
	children,
	className,
	...props
}: MenuSectionProps<T>) {
	return (
		<AriaMenuSection
			{...props}
			className={`not-first:mt-1 not-first:border-border not-first:border-t not-first:pt-1 ${className ?? ""}`}
		>
			{title ? (
				<Header className="px-2.5 py-1.5 font-medium text-muted text-xs">{title}</Header>
			) : null}
			{typeof children === "function" ? (
				<Collection items={items ?? []}>{children}</Collection>
			) : (
				children
			)}
		</AriaMenuSection>
	);
}

export function MenuSeparator({ className }: { className?: string }) {
	return <Separator className={`my-1 h-px bg-border ${className ?? ""}`} />;
}

export { MenuTrigger, SubmenuTrigger };
