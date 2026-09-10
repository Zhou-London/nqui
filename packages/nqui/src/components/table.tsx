import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import {
	Cell as AriaCell,
	type CellProps as AriaCellProps,
	Column as AriaColumn,
	type ColumnProps as AriaColumnProps,
	Row as AriaRow,
	type RowProps as AriaRowProps,
	Table as AriaTable,
	TableBody as AriaTableBody,
	type TableBodyProps as AriaTableBodyProps,
	TableHeader as AriaTableHeader,
	type TableHeaderProps as AriaTableHeaderProps,
	type TableProps as AriaTableProps,
	Collection,
	ColumnResizer,
	composeRenderProps,
	ResizableTableContainer,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRingInset } from "../utils/focus-ring";
import { Checkbox } from "./checkbox";

export interface TableContainerProps {
	children: ReactNode;
	className?: string;
	/** Enable column resizing for `Column`s that set `allowsResizing`. */
	isResizable?: boolean;
	/** Remove the rounded border, e.g. inside a `Card`. */
	bare?: boolean;
}

/** Scrolling frame with the rounded hairline border every table sits in. */
export function TableContainer({ children, className, isResizable, bare }: TableContainerProps) {
	const cls = cn(
		"relative w-full overflow-auto",
		!bare && "rounded-xl border border-border bg-surface",
		className,
	);
	return isResizable ? (
		<ResizableTableContainer className={cls}>{children}</ResizableTableContainer>
	) : (
		<div className={cls}>{children}</div>
	);
}

export interface TableProps extends Omit<AriaTableProps, "className"> {
	className?: string;
	density?: "compact" | "comfortable" | "spacious";
	striped?: boolean;
}

/** Accessible data table with sorting and selection. For large or virtualized data use `DataGrid`. */
export function Table({ density = "comfortable", striped, className, ...props }: TableProps) {
	return (
		<AriaTable
			{...props}
			data-density={density}
			data-striped={striped ? "" : undefined}
			className={composeRenderProps(className, (cls) =>
				cn("group/table w-full border-separate border-spacing-0 text-sm", cls),
			)}
		/>
	);
}

export interface TableHeaderProps<T extends object>
	extends Omit<AriaTableHeaderProps<T>, "className" | "children"> {
	className?: string;
	children: ReactNode | ((column: T) => ReactElement);
	/** Prepend the select-all checkbox column. */
	allowsSelection?: boolean;
}

export function TableHeader<T extends object>({
	className,
	allowsSelection,
	columns,
	children,
	...props
}: TableHeaderProps<T>) {
	return (
		<AriaTableHeader
			{...props}
			className={composeRenderProps(className, (cls) => cn("sticky top-0 z-10", cls))}
		>
			{allowsSelection ? (
				<AriaColumn
					width={40}
					minWidth={40}
					className="border-border border-b bg-surface-2 px-4 text-left"
				>
					<Checkbox slot="selection" size="sm" />
				</AriaColumn>
			) : null}
			{typeof children === "function" ? (
				<Collection items={columns ?? []}>{children}</Collection>
			) : (
				children
			)}
		</AriaTableHeader>
	);
}

export interface ColumnProps extends Omit<AriaColumnProps, "className"> {
	className?: string;
	align?: "start" | "center" | "end";
	allowsResizing?: boolean;
}

export function Column({
	className,
	align = "start",
	allowsResizing,
	children,
	...props
}: ColumnProps) {
	return (
		<AriaColumn
			{...props}
			className={composeRenderProps(className, (cls) =>
				cn(
					"group/col whitespace-nowrap border-border border-b bg-surface-2 px-4 font-medium text-muted text-xs",
					"group-data-[density=compact]/table:h-8 group-data-[density=comfortable]/table:h-10 group-data-[density=spacious]/table:h-12",
					"max-lg:group-data-[density=compact]/table:h-11 max-lg:group-data-[density=comfortable]/table:h-11",
					"first:rounded-tl-[inherit] last:rounded-tr-[inherit]",
					align === "end" ? "text-right" : align === "center" ? "text-center" : "text-left",
					cls,
				),
			)}
		>
			{composeRenderProps(children, (content, { allowsSorting, sortDirection }) => (
				<span
					className={cn(
						"relative flex items-center gap-1",
						align === "end" && "flex-row-reverse",
						align === "center" && "justify-center",
					)}
				>
					<span className="truncate">{content}</span>
					{allowsSorting ? (
						<span
							aria-hidden
							className={cn(
								"shrink-0 transition-opacity [&_svg]:size-4",
								sortDirection ? "opacity-100" : "opacity-0 group-hover/col:opacity-60",
							)}
						>
							{sortDirection === "ascending" ? (
								<ArrowUp />
							) : sortDirection === "descending" ? (
								<ArrowDown />
							) : (
								<ArrowUpDown />
							)}
						</span>
					) : null}
					{allowsResizing ? (
						<ColumnResizer className="absolute inset-y-0 -right-3 w-3 cursor-col-resize touch-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border hover:after:bg-primary resizing:after:w-0.5 resizing:after:bg-primary max-lg:-right-[34px] max-lg:w-11 max-lg:after:right-[22px]" />
					) : null}
				</span>
			))}
		</AriaColumn>
	);
}

export interface TableBodyProps<T extends object> extends Omit<AriaTableBodyProps<T>, "className"> {
	className?: string;
}

export function TableBody<T extends object>({
	className,
	renderEmptyState,
	...props
}: TableBodyProps<T>) {
	return (
		<AriaTableBody
			{...props}
			renderEmptyState={
				renderEmptyState ??
				(() => <div className="py-12 text-center text-muted text-sm">No rows.</div>)
			}
			className={composeRenderProps(className, (cls) => cn("", cls))}
		/>
	);
}

export interface RowProps<T extends object>
	extends Omit<AriaRowProps<T>, "className" | "children"> {
	className?: string;
	allowsSelection?: boolean;
	children: ReactNode | ((column: T) => ReactElement);
}

export function Row<T extends object>({
	className,
	allowsSelection,
	columns,
	children,
	...props
}: RowProps<T>) {
	return (
		<AriaRow
			{...props}
			className={composeRenderProps(className, (cls) =>
				cn(
					focusRingInset(),
					"group/row relative transition-colors",
					"hover:bg-surface-2/70 selected:bg-primary-soft selected:hover:bg-primary-soft",
					"group-data-striped/table:even:bg-surface-2/50",
					"disabled:text-subtle href:cursor-pointer",
					cls,
				),
			)}
		>
			{allowsSelection ? (
				<AriaCell className="border-border border-b px-4 group-last/row:border-b-0">
					<Checkbox slot="selection" size="sm" />
				</AriaCell>
			) : null}
			{typeof children === "function" ? (
				<Collection items={columns ?? []}>{children}</Collection>
			) : (
				children
			)}
		</AriaRow>
	);
}

export interface CellProps extends Omit<AriaCellProps, "className"> {
	className?: string;
	align?: "start" | "center" | "end";
	/** Use tabular figures. */
	numeric?: boolean;
}

export function Cell({ className, align = "start", numeric, ...props }: CellProps) {
	return (
		<AriaCell
			{...props}
			className={composeRenderProps(className, (cls) =>
				cn(
					focusRingInset(),
					"truncate border-border border-b px-4 py-1 text-foreground group-last/row:border-b-0",
					"group-data-[density=compact]/table:h-8 group-data-[density=comfortable]/table:h-10 group-data-[density=spacious]/table:h-12",
					"max-lg:group-data-[density=compact]/table:h-11 max-lg:group-data-[density=comfortable]/table:h-11",
					align === "end" ? "text-right" : align === "center" ? "text-center" : "text-left",
					numeric && "numeric",
					cls,
				),
			)}
		/>
	);
}
