import { X } from "lucide-react";
import type { ReactNode } from "react";
import {
	Tag as AriaTag,
	TagGroup as AriaTagGroup,
	type TagGroupProps as AriaTagGroupProps,
	TagList as AriaTagList,
	type TagListProps as AriaTagListProps,
	type TagProps as AriaTagProps,
	Button,
	composeRenderProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/focus-ring";
import { tv, type VariantProps } from "../utils/tv";
import { Description, FieldError, type FieldProps, Label } from "./field";

export const tagStyles = tv({
	extend: focusRing,
	base: [
		"relative touch-target flex h-8 cursor-default items-center gap-1 rounded-full border px-4 font-medium text-xs transition-colors",
		"border-border bg-surface text-foreground hover:bg-surface-2",
		"selected:border-transparent selected:bg-accent selected:text-accent-foreground",
		"disabled:opacity-50",
	],
	variants: {
		color: {
			neutral: "",
			primary: "selected:bg-primary selected:text-primary-foreground",
		},
	},
	defaultVariants: { color: "neutral" },
});

export interface TagGroupProps<T extends object>
	extends Omit<AriaTagGroupProps, "children" | "className">,
		Pick<AriaTagListProps<T>, "items" | "children" | "renderEmptyState">,
		FieldProps {
	className?: string;
	color?: VariantProps<typeof tagStyles>["color"];
}

/** Selectable or removable chips: filters, labels, recipients. */
export function TagGroup<T extends object>({
	label,
	description,
	errorMessage,
	items,
	children,
	renderEmptyState,
	className,
	...props
}: TagGroupProps<T>) {
	return (
		<AriaTagGroup {...props} className={cn("group flex flex-col gap-2", className)}>
			{label ? <Label>{label}</Label> : null}
			<AriaTagList
				items={items}
				renderEmptyState={renderEmptyState}
				className="flex flex-wrap gap-2"
			>
				{children}
			</AriaTagList>
			{description ? <Description>{description}</Description> : null}
			<FieldError>{errorMessage}</FieldError>
		</AriaTagGroup>
	);
}

export interface TagProps extends Omit<AriaTagProps, "className">, VariantProps<typeof tagStyles> {
	className?: AriaTagProps["className"];
	icon?: ReactNode;
}

export function Tag({ color, icon, className, children, ...props }: TagProps) {
	const textValue = props.textValue ?? (typeof children === "string" ? children : undefined);
	return (
		<AriaTag
			{...props}
			textValue={textValue}
			className={composeRenderProps(className, (cls, rp) =>
				tagStyles({ ...rp, color, className: cls }),
			)}
		>
			{composeRenderProps(children, (content, { allowsRemoving }) => (
				<>
					{icon}
					{content}
					{allowsRemoving ? (
						<Button
							slot="remove"
							aria-label="Remove"
							className={focusRing({
								className:
									"-mr-2 ml-1 flex size-4 items-center justify-center rounded-full hover:bg-foreground/10 max-lg:-mr-4 max-lg:size-7",
							})}
						>
							<X aria-hidden className="size-3" />
						</Button>
					) : null}
				</>
			))}
		</AriaTag>
	);
}
