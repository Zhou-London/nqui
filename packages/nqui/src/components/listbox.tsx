import { Check } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import {
	ListBox as AriaListBox,
	ListBoxItem as AriaListBoxItem,
	type ListBoxItemProps as AriaListBoxItemProps,
	type ListBoxProps as AriaListBoxProps,
	ListBoxSection as AriaListBoxSection,
	type ListBoxSectionProps as AriaListBoxSectionProps,
	Collection,
	composeRenderProps,
	Header,
	Text,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRingInset } from "../utils/focus-ring";
import { tv } from "../utils/tv";

export const listBoxStyles = tv({
	base: "flex flex-col gap-0.5 p-1 outline-hidden",
});

export const listItemStyles = tv({
	extend: focusRingInset,
	base: [
		"group relative flex cursor-default select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-foreground text-sm",
		"transition-colors duration-100 focus:bg-surface-2 hover:bg-surface-2",
		"disabled:pointer-events-none disabled:text-subtle",
		"selected:font-medium",
		"[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted",
	],
	variants: {
		color: {
			neutral: "",
			danger: "text-danger-text focus:bg-danger-soft hover:bg-danger-soft [&_svg]:text-danger-text",
		},
	},
	defaultVariants: { color: "neutral" },
});

export interface ListBoxProps<T extends object> extends Omit<AriaListBoxProps<T>, "className"> {
	className?: AriaListBoxProps<T>["className"];
}

export function ListBox<T extends object>({ className, ...props }: ListBoxProps<T>) {
	return (
		<AriaListBox
			{...props}
			className={composeRenderProps(className, (cls) => listBoxStyles({ className: cls }))}
		/>
	);
}

export interface ListBoxItemProps<T extends object = object>
	extends Omit<AriaListBoxItemProps<T>, "className"> {
	className?: AriaListBoxItemProps<T>["className"];
	icon?: ReactNode;
	description?: ReactNode;
	color?: "neutral" | "danger";
	/** Show a check mark when selected (default true in single/multiple selection). */
	showCheck?: boolean;
}

/** Row inside `ListBox`, `Select`, and `ComboBox`. */
export function ListBoxItem<T extends object = object>({
	className,
	icon,
	description,
	color,
	showCheck = true,
	children,
	...props
}: ListBoxItemProps<T>) {
	const textValue = props.textValue ?? (typeof children === "string" ? children : undefined);
	return (
		<AriaListBoxItem
			{...props}
			textValue={textValue}
			className={composeRenderProps(className, (cls, rp) =>
				listItemStyles({ ...rp, color, className: cls }),
			)}
		>
			{composeRenderProps(children, (content, { isSelected, selectionMode }) => (
				<>
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
					{showCheck && selectionMode !== "none" ? (
						<Check aria-hidden className={isSelected ? "text-primary! opacity-100" : "opacity-0"} />
					) : null}
				</>
			))}
		</AriaListBoxItem>
	);
}

export interface ListBoxSectionProps<T extends object>
	extends Omit<AriaListBoxSectionProps<T>, "children"> {
	title?: ReactNode;
	items?: Iterable<T>;
	children: ReactNode | ((item: T) => ReactElement);
}

export function ListBoxSection<T extends object>({
	title,
	items,
	children,
	className,
	...props
}: ListBoxSectionProps<T>) {
	return (
		<AriaListBoxSection
			{...props}
			className={cn(
				"not-first:mt-1 not-first:border-border not-first:border-t not-first:pt-1",
				className,
			)}
		>
			{title ? (
				<Header className="px-2.5 py-1.5 font-medium text-muted text-xs">{title}</Header>
			) : null}
			{typeof children === "function" ? (
				<Collection items={items ?? []}>{children}</Collection>
			) : (
				children
			)}
		</AriaListBoxSection>
	);
}
