import {
	type Column,
	type ColumnDef,
	type ColumnVisibilityState,
	columnFilteringFeature,
	columnPinningFeature,
	columnResizingFeature,
	columnSizingFeature,
	columnVisibilityFeature,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	filterFns,
	globalFilteringFeature,
	type Header,
	type Row,
	type RowData,
	type RowSelectionState,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	type SortingState,
	sortFns,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Columns3 } from "lucide-react";
import {
	type CSSProperties,
	type FocusEvent,
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import { EmptyState } from "../components/empty-state";
import { Menu, MenuItem, MenuTrigger } from "../components/menu";
import { Pagination } from "../components/pagination";
import { Skeleton } from "../components/skeleton";
import { SearchField } from "../components/text-field";
import { cn } from "../utils/cn";
import {
	formatBytes,
	formatCompact,
	formatCurrency,
	formatDelta,
	formatDuration,
	formatNumber,
	formatPercent,
} from "../utils/format";

export type { ColumnVisibilityState, RowSelectionState, SortingState };

export type DataGridFormat =
	| "text"
	| "number"
	| "integer"
	| "compact"
	| "currency"
	| "percent"
	| "delta"
	| "deltaPercent"
	| "bytes"
	| "duration"
	| "date"
	| "datetime"
	| "time"
	| "boolean";

export interface DataGridCellContext<T> {
	value: unknown;
	row: T;
	rowIndex: number;
	column: DataGridColumn<T>;
}

export interface DataGridColumn<T> {
	/** Unique id; defaults to `accessorKey`. */
	id?: string;
	/** Top-level field to read. Use `accessorFn` for nested or computed values. */
	accessorKey?: keyof T & string;
	accessorFn?: (row: T, index: number) => unknown;
	header?: ReactNode;
	/** Custom cell renderer; overrides `format`. */
	cell?: (ctx: DataGridCellContext<T>) => ReactNode;
	/** Footer content or a function of the currently filtered rows. */
	footer?: ReactNode | ((rows: T[]) => ReactNode);
	/** Built-in formatter applied when `cell` is omitted. */
	format?: DataGridFormat;
	numberOptions?: Intl.NumberFormatOptions;
	dateOptions?: Intl.DateTimeFormatOptions;
	currency?: string;
	decimals?: number;
	align?: "start" | "center" | "end";
	/** Tabular figures and right alignment; defaults to true for numeric formats. */
	numeric?: boolean;
	size?: number;
	minSize?: number;
	maxSize?: number;
	enableSorting?: boolean;
	enableResizing?: boolean;
	enableHiding?: boolean;
	sortDescFirst?: boolean;
	/** Stick the column to an edge while scrolling horizontally. */
	pinned?: "start" | "end";
	className?: string;
	headerClassName?: string;
	/** Clip long text with an ellipsis (default true). */
	truncate?: boolean;
	meta?: Record<string, unknown>;
}

export type DataGridDensity = "compact" | "comfortable" | "spacious";

export interface DataGridToolbarOptions {
	title?: ReactNode;
	search?: boolean;
	columns?: boolean;
	/** Extra controls after the search field. */
	start?: ReactNode;
	/** Extra controls on the right. */
	end?: ReactNode;
}

export interface DataGridProps<T> {
	/** Memoize this array: a new identity rebuilds every column definition. */
	columns: DataGridColumn<T>[];
	data: T[];
	getRowId?: (row: T, index: number) => string;
	"aria-label"?: string;
	className?: string;

	sorting?: SortingState;
	defaultSorting?: SortingState;
	onSortingChange?: (sorting: SortingState) => void;
	enableSorting?: boolean;
	/** Sorting is handled by the server; rows are rendered in the given order. */
	manualSorting?: boolean;

	globalFilter?: string;
	onGlobalFilterChange?: (value: string) => void;

	selectionMode?: "none" | "single" | "multiple";
	selectedRowIds?: RowSelectionState;
	defaultSelectedRowIds?: RowSelectionState;
	onSelectionChange?: (ids: RowSelectionState, rows: T[]) => void;

	columnVisibility?: ColumnVisibilityState;
	onColumnVisibilityChange?: (visibility: ColumnVisibilityState) => void;

	enableResizing?: boolean;
	density?: DataGridDensity;
	/** Override the density row height in pixels. */
	rowHeight?: number;
	striped?: boolean;
	/** Vertical hairlines between cells. */
	bordered?: boolean;
	stickyHeader?: boolean;
	/** Fixed height of the scroll area. */
	height?: number | string;
	/** Maximum height of the scroll area (default 560px when virtualized). */
	maxHeight?: number | string;
	/** Render only visible rows. `auto` switches on above 200 rows. */
	virtualize?: boolean | "auto";

	isLoading?: boolean;
	loadingRows?: number;
	emptyState?: ReactNode;

	/** Double-click or Enter on a row. */
	onRowAction?: (row: T) => void;
	rowClassName?: (row: T, index: number) => string | undefined;

	/** Client-side pagination. */
	pagination?: boolean | { pageSize?: number; pageSizeOptions?: number[] };
	toolbar?: boolean | DataGridToolbarOptions;
	showFooter?: boolean;
	/** Remove the outer border and radius, e.g. when nested in a Card. */
	bare?: boolean;
}

const features = tableFeatures({
	rowSortingFeature,
	columnFilteringFeature,
	globalFilteringFeature,
	rowSelectionFeature,
	columnPinningFeature,
	columnSizingFeature,
	columnResizingFeature,
	columnVisibilityFeature,
	rowPaginationFeature,
	sortFns,
	filterFns,
	sortedRowModel: createSortedRowModel(),
	filteredRowModel: createFilteredRowModel(),
	paginatedRowModel: createPaginatedRowModel(),
});

type Features = typeof features;

const NUMERIC_FORMATS = new Set<DataGridFormat>([
	"number",
	"integer",
	"compact",
	"currency",
	"percent",
	"delta",
	"deltaPercent",
	"bytes",
	"duration",
]);

const densityHeights: Record<DataGridDensity, number> = {
	compact: 32,
	comfortable: 40,
	spacious: 48,
};

const dateFormatters = new Map<string, Intl.DateTimeFormat>();
function dateFormat(
	kind: "date" | "datetime" | "time",
	options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
	const key = `${kind}|${JSON.stringify(options ?? {})}`;
	let f = dateFormatters.get(key);
	if (!f) {
		const base: Intl.DateTimeFormatOptions =
			kind === "date"
				? { year: "numeric", month: "short", day: "numeric" }
				: kind === "time"
					? { hour: "2-digit", minute: "2-digit", second: "2-digit" }
					: { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
		f = new Intl.DateTimeFormat(undefined, { ...base, ...options });
		dateFormatters.set(key, f);
	}
	return f;
}

const placeholder = <span className="text-subtle">–</span>;

function DeltaValue({ value, percent }: { value: number; percent?: boolean }) {
	const text = percent ? formatPercent(value) : formatDelta(value);
	// Color follows the rounded text, so 0.001 shown as "0" is neutral rather than up.
	const zero = text === (percent ? formatPercent(0) : formatDelta(0));
	const cls = zero ? "text-muted" : value > 0 ? "text-up-text" : "text-down-text";
	return <span className={cls}>{text}</span>;
}

export function formatCellValue<T extends RowData>(
	value: unknown,
	column: DataGridColumn<T>,
): ReactNode {
	if (value === null || value === undefined || value === "") return placeholder;
	const num = typeof value === "number" ? value : Number(value);
	if (column.format && NUMERIC_FORMATS.has(column.format) && !Number.isFinite(num))
		return placeholder;
	switch (column.format) {
		case "number":
			return formatNumber(num, {
				maximumFractionDigits: column.decimals ?? 2,
				...column.numberOptions,
			});
		case "integer":
			return formatNumber(num, { maximumFractionDigits: 0, ...column.numberOptions });
		case "compact":
			return formatCompact(num, column.numberOptions);
		case "currency":
			return formatCurrency(num, column.currency ?? "USD", {
				minimumFractionDigits: column.decimals ?? 2,
				maximumFractionDigits: column.decimals ?? 2,
				...column.numberOptions,
			});
		case "percent":
			return formatPercent(num, {
				signDisplay: "auto",
				maximumFractionDigits: column.decimals ?? 2,
				...column.numberOptions,
			});
		case "delta":
			return <DeltaValue value={num} />;
		case "deltaPercent":
			return <DeltaValue value={num} percent />;
		case "bytes":
			return formatBytes(num, column.decimals ?? 1);
		case "duration":
			return formatDuration(num);
		case "date":
		case "datetime":
		case "time":
			return dateFormat(column.format, column.dateOptions).format(
				value instanceof Date ? value : new Date(value as string | number),
			);
		case "boolean":
			return value ? (
				<Check className="size-4 text-success" aria-label="true" />
			) : (
				<span className="text-subtle">–</span>
			);
		default:
			return typeof value === "object" ? JSON.stringify(value) : String(value);
	}
}

/** Soft shadow on the pinned boundary, shown only while content is scrolled beneath it. */
const edgeShadowStart = "shadow-[8px_0_12px_-8px_color-mix(in_oklab,var(--nq-fg)_18%,transparent)]";
const edgeShadowEnd = "shadow-[-8px_0_12px_-8px_color-mix(in_oklab,var(--nq-fg)_18%,transparent)]";

function cssVarName(id: string): string {
	return `--nq-col-${id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function pinStyle<T extends RowData>(column: Column<Features, T>): CSSProperties | undefined {
	const pinned = column.getIsPinned();
	if (!pinned) return undefined;
	return pinned === "start"
		? { position: "sticky", left: column.getStart("start"), zIndex: 2 }
		: { position: "sticky", right: column.getAfter("end"), zIndex: 2 };
}

function useControllable<V>(
	value: V | undefined,
	defaultValue: V,
	onChange?: (v: V) => void,
): [V, (v: V | ((old: V) => V)) => void] {
	const [internal, setInternal] = useState(defaultValue);
	const isControlled = value !== undefined;
	const current = isControlled ? value : internal;
	const ref = useRef(current);
	ref.current = current;
	const set = useCallback(
		(next: V | ((old: V) => V)) => {
			const resolved = typeof next === "function" ? (next as (old: V) => V)(ref.current) : next;
			if (!isControlled) setInternal(resolved);
			onChange?.(resolved);
		},
		[isControlled, onChange],
	);
	return [current, set];
}

/**
 * High-density data grid on TanStack Table: sorting, global search, row selection, pinned
 * columns, resizing, column visibility, pagination, and row virtualization.
 */
export function DataGrid<T extends RowData>({
	columns,
	data,
	getRowId,
	"aria-label": ariaLabel,
	className,
	sorting: sortingProp,
	defaultSorting = [],
	onSortingChange,
	enableSorting = true,
	manualSorting = false,
	globalFilter: globalFilterProp,
	onGlobalFilterChange,
	selectionMode = "none",
	selectedRowIds,
	defaultSelectedRowIds = {},
	onSelectionChange,
	columnVisibility: columnVisibilityProp,
	onColumnVisibilityChange,
	enableResizing = false,
	density = "comfortable",
	rowHeight: rowHeightProp,
	striped = false,
	bordered = false,
	stickyHeader = true,
	height,
	maxHeight,
	virtualize = "auto",
	isLoading = false,
	loadingRows = 8,
	emptyState,
	onRowAction,
	rowClassName,
	pagination,
	toolbar,
	showFooter = false,
	bare = false,
}: DataGridProps<T>) {
	const [sorting, setSorting] = useControllable<SortingState>(
		sortingProp,
		defaultSorting,
		onSortingChange,
	);
	const [globalFilter, setGlobalFilter] = useControllable<string>(
		globalFilterProp,
		"",
		onGlobalFilterChange,
	);
	const [rowSelection, setRowSelection] = useControllable<RowSelectionState>(
		selectedRowIds,
		defaultSelectedRowIds,
	);
	const [columnVisibility, setColumnVisibility] = useControllable<ColumnVisibilityState>(
		columnVisibilityProp,
		{},
		onColumnVisibilityChange,
	);

	const rowHeight = rowHeightProp ?? densityHeights[density];
	const pageSize = pagination
		? (typeof pagination === "object" && pagination.pageSize) || 25
		: Number.MAX_SAFE_INTEGER;

	const tableColumns = useMemo<ColumnDef<Features, T>[]>(() => {
		const defs: ColumnDef<Features, T>[] = columns.map((c, i) => {
			const id = c.id ?? c.accessorKey ?? `col_${i}`;
			const key = c.accessorKey;
			const accessorFn =
				c.accessorFn ?? (key ? (row: T) => (row as Record<string, unknown>)[key] : () => undefined);
			return {
				id,
				accessorFn,
				header: () => c.header ?? id,
				cell: ({ getValue, row }) =>
					c.cell
						? c.cell({ value: getValue(), row: row.original, rowIndex: row.index, column: c })
						: formatCellValue(getValue(), c),
				footer: ({ table }) =>
					typeof c.footer === "function"
						? c.footer(table.getFilteredRowModel().rows.map((r) => r.original))
						: c.footer,
				size: c.size ?? 150,
				minSize: c.minSize ?? 56,
				maxSize: c.maxSize ?? 1200,
				enableSorting: c.enableSorting ?? enableSorting,
				enableResizing: c.enableResizing ?? enableResizing,
				enableHiding: c.enableHiding ?? true,
				sortDescFirst: c.sortDescFirst ?? (c.format ? NUMERIC_FORMATS.has(c.format) : false),
				enableGlobalFilter: !c.format || c.format === "text",
				meta: { column: c },
			};
		});
		if (selectionMode === "multiple") {
			defs.unshift({
				id: "__select",
				size: 40,
				minSize: 40,
				maxSize: 40,
				enableSorting: false,
				enableResizing: false,
				enableHiding: false,
				enableGlobalFilter: false,
				header: ({ table }) => (
					<Checkbox
						aria-label="Select all"
						size="sm"
						isSelected={table.getIsAllRowsSelected()}
						isIndeterminate={!table.getIsAllRowsSelected() && table.getIsSomeRowsSelected()}
						onChange={(v) => table.toggleAllRowsSelected(v)}
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						aria-label="Select row"
						size="sm"
						isSelected={row.getIsSelected()}
						isDisabled={!row.getCanSelect()}
						onChange={() => row.toggleSelected()}
					/>
				),
				meta: { column: { pinned: "start" } },
			});
		}
		return defs;
	}, [columns, enableSorting, enableResizing, selectionMode]);

	const columnPinning = useMemo(() => {
		const start = selectionMode === "multiple" ? ["__select"] : [];
		const end: string[] = [];
		columns.forEach((c, i) => {
			const id = c.id ?? c.accessorKey ?? `col_${i}`;
			if (c.pinned === "start") start.push(id);
			if (c.pinned === "end") end.push(id);
		});
		return { start, end };
	}, [columns, selectionMode]);

	const table = useTable<Features, T>({
		features,
		columns: tableColumns,
		data,
		getRowId,
		state: { sorting, globalFilter, rowSelection, columnVisibility, columnPinning },
		initialState: { pagination: { pageIndex: 0, pageSize } },
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onRowSelectionChange: setRowSelection,
		onColumnVisibilityChange: setColumnVisibility,
		enableRowSelection: selectionMode !== "none",
		enableMultiRowSelection: selectionMode === "multiple",
		enableColumnResizing: enableResizing,
		columnResizeMode: "onChange",
		manualSorting,
		globalFilterFn: "includesString",
	});

	// Notify selection changes with the resolved rows.
	const selectionRef = useRef(rowSelection);
	useEffect(() => {
		if (selectionRef.current === rowSelection) return;
		selectionRef.current = rowSelection;
		onSelectionChange?.(
			rowSelection,
			table.getSelectedRowModel().rows.map((r) => r.original),
		);
	}, [rowSelection, onSelectionChange, table]);

	// Keep the page size in step with the prop after mount.
	useEffect(() => {
		if (table.store.state.pagination?.pageSize !== pageSize) table.setPageSize(pageSize);
	}, [pageSize, table]);

	const rows = table.getRowModel().rows;
	const totalRows = table.getFilteredRowModel().rows.length;
	const pageIndex = table.store.state.pagination?.pageIndex ?? 0;
	const rowOffset = pageIndex * (table.store.state.pagination?.pageSize ?? pageSize);
	const headerHeight = density === "compact" ? 32 : 40;
	const shouldVirtualize = virtualize === true || (virtualize === "auto" && rows.length > 200);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [scrolled, setScrolled] = useState({ start: false, end: false });
	const onScroll = () => {
		const el = scrollRef.current;
		if (!el) return;
		const start = el.scrollLeft > 0;
		const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
		if (start !== scrolled.start || end !== scrolled.end) setScrolled({ start, end });
	};
	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => rowHeight,
		overscan: 12,
		enabled: shouldVirtualize,
		// The sticky header sits above the rows inside the same scroll element.
		scrollMargin: headerHeight,
	});

	// Column widths as CSS variables so resizing does not re-style every cell through React.
	const widthVars: Record<string, string> = {};
	for (const col of table.getAllLeafColumns()) widthVars[cssVarName(col.id)] = `${col.getSize()}px`;

	const startCols = table.getStartLeafColumns();
	const endCols = table.getEndLeafColumns();
	const lastStartId = startCols[startCols.length - 1]?.id;
	const firstEndId = endCols[0]?.id;

	// Roving focus across cells. The grid only moves focus while it owns it, so re-renders
	// never pull focus back from another control.
	const [focus, setFocus] = useState<{ r: number; c: number } | null>(null);
	const focusWithin = useRef(false);
	const gridRef = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		if (!focus || !focusWithin.current) return;
		const el = gridRef.current?.querySelector<HTMLElement>(`[data-cell="${focus.r}:${focus.c}"]`);
		if (el && document.activeElement !== el) el.focus({ preventScroll: true });
	}, [focus]);
	const onBlur = (e: FocusEvent<HTMLDivElement>) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focusWithin.current = false;
	};
	const tabCell = focus ?? { r: 0, c: 0 };

	const colCount = table.getVisibleLeafColumns().length;
	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		// Headers and toolbar controls handle their own keys.
		if (!focus || !(e.target as HTMLElement).closest("[data-cell]")) return;
		let { r, c } = focus;
		switch (e.key) {
			case "ArrowDown":
				r = Math.min(r + 1, rows.length - 1);
				break;
			case "ArrowUp":
				r = Math.max(r - 1, 0);
				break;
			case "ArrowRight":
				c = Math.min(c + 1, colCount - 1);
				break;
			case "ArrowLeft":
				c = Math.max(c - 1, 0);
				break;
			case "Home":
				c = 0;
				if (e.ctrlKey || e.metaKey) r = 0;
				break;
			case "End":
				c = colCount - 1;
				if (e.ctrlKey || e.metaKey) r = rows.length - 1;
				break;
			case "PageDown":
				r = Math.min(r + 20, rows.length - 1);
				break;
			case "PageUp":
				r = Math.max(r - 20, 0);
				break;
			case "Enter": {
				const row = rows[r];
				if (row && onRowAction) onRowAction(row.original);
				return;
			}
			case " ": {
				const row = rows[r];
				if (row && selectionMode !== "none") {
					e.preventDefault();
					if (selectionMode === "single") setRowSelection({ [row.id]: true });
					else row.toggleSelected();
				}
				return;
			}
			default:
				return;
		}
		e.preventDefault();
		if (shouldVirtualize) virtualizer.scrollToIndex(r);
		setFocus({ r, c });
	};

	const handleRowClick = (row: Row<Features, T>) => {
		if (selectionMode === "single") setRowSelection(row.getIsSelected() ? {} : { [row.id]: true });
		else if (selectionMode === "none" && onRowAction) onRowAction(row.original);
	};

	const toolbarOpts: DataGridToolbarOptions | null = toolbar
		? toolbar === true
			? { search: true, columns: true }
			: { search: true, columns: true, ...toolbar }
		: null;
	const hideableColumns = table
		.getAllLeafColumns()
		.filter((c) => c.columnDef.enableHiding !== false);

	const showSkeleton = isLoading && data.length === 0;
	const skeletonKeys = useMemo(
		() => Array.from({ length: loadingRows }, (_, i) => `skeleton-${i}`),
		[loadingRows],
	);
	// `flex-basis: auto` so `height` is honored; the default `flex-1` (basis 0%) ignores it and
	// lets the area grow to its content. Without a height the area fills a fixed-height parent.
	const scrollStyle: CSSProperties = {
		height,
		maxHeight: maxHeight ?? (shouldVirtualize && height === undefined ? 560 : undefined),
		flex: height === undefined ? "1 1 auto" : "0 1 auto",
	};

	const renderHeader = (header: Header<Features, T>) => {
		const col = header.column;
		const def = (col.columnDef.meta as { column?: DataGridColumn<T> } | undefined)?.column;
		const align =
			def?.align ??
			((def?.numeric ?? (def?.format ? NUMERIC_FORMATS.has(def.format) : false)) ? "end" : "start");
		const canSort = col.getCanSort();
		const sorted = col.getIsSorted();
		const pinned = col.getIsPinned();
		return (
			<div
				key={header.id}
				role="columnheader"
				aria-sort={
					sorted === "asc"
						? "ascending"
						: sorted === "desc"
							? "descending"
							: canSort
								? "none"
								: undefined
				}
				className={cn(
					"group/h relative flex shrink-0 select-none items-center gap-1 px-3 font-medium text-muted text-xs",
					bordered && "border-r last:border-r-0",
					pinned && "bg-surface-2",
					pinned === "start" && col.id === lastStartId && scrolled.start && edgeShadowStart,
					pinned === "end" && col.id === firstEndId && scrolled.end && edgeShadowEnd,
					canSort && "cursor-pointer hover:text-foreground",
					align === "end" && "flex-row-reverse text-right",
					align === "center" && "justify-center",
					def?.headerClassName,
				)}
				style={{ width: `var(${cssVarName(col.id)})`, height: headerHeight, ...pinStyle(col) }}
				tabIndex={canSort ? 0 : -1}
				onClick={canSort ? col.getToggleSortingHandler() : undefined}
				onKeyDown={
					canSort
						? (e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									e.stopPropagation();
									col.toggleSorting();
								}
							}
						: undefined
				}
			>
				<span className="truncate">
					{header.isPlaceholder ? null : <table.FlexRender header={header} />}
				</span>
				{canSort ? (
					<span
						aria-hidden
						className={cn(
							"shrink-0 transition-opacity [&_svg]:size-3.5",
							sorted ? "opacity-100 text-foreground" : "opacity-0 group-hover/h:opacity-60",
						)}
					>
						{sorted === "asc" ? <ArrowUp /> : sorted === "desc" ? <ArrowDown /> : <ArrowUpDown />}
					</span>
				) : null}
				{col.getCanResize() ? (
					<div
						aria-hidden
						onMouseDown={header.getResizeHandler()}
						onTouchStart={header.getResizeHandler()}
						onClick={(e) => e.stopPropagation()}
						className={cn(
							"absolute inset-y-0 right-0 z-10 w-2 cursor-col-resize touch-none select-none",
							"after:absolute after:inset-y-2 after:right-0 after:w-px after:bg-border-strong after:opacity-0 after:transition-opacity hover:after:opacity-100",
							col.getIsResizing() && "after:w-0.5 after:bg-primary after:opacity-100",
						)}
					/>
				) : null}
			</div>
		);
	};

	const renderRow = (row: Row<Features, T>, index: number, style?: CSSProperties) => {
		const selected = row.getIsSelected();
		return (
			<div
				key={row.id}
				role="row"
				aria-rowindex={rowOffset + index + 2}
				aria-selected={selectionMode !== "none" ? selected : undefined}
				data-index={index}
				ref={shouldVirtualize ? virtualizer.measureElement : undefined}
				className={cn(
					"group/row flex border-border border-b transition-colors last:border-b-0",
					striped && index % 2 === 1 && "bg-surface-2/50",
					"hover:bg-surface-2/70",
					selected && "bg-primary-soft hover:bg-primary-soft",
					(onRowAction || selectionMode !== "none") && "cursor-pointer",
					rowClassName?.(row.original, index),
				)}
				style={{ height: rowHeight, ...style }}
				onClick={() => handleRowClick(row)}
				onDoubleClick={
					onRowAction && selectionMode !== "none" ? () => onRowAction(row.original) : undefined
				}
			>
				{row.getVisibleCells().map((cell, c) => {
					const col = cell.column;
					const def = (col.columnDef.meta as { column?: DataGridColumn<T> } | undefined)?.column;
					const numeric = def?.numeric ?? (def?.format ? NUMERIC_FORMATS.has(def.format) : false);
					const align = def?.align ?? (numeric ? "end" : "start");
					const pinned = col.getIsPinned();
					const isTabbable = tabCell.r === index && tabCell.c === c;
					return (
						<div
							key={cell.id}
							role="gridcell"
							data-cell={`${index}:${c}`}
							tabIndex={isTabbable ? 0 : -1}
							onFocus={() => {
								focusWithin.current = true;
								setFocus({ r: index, c });
							}}
							className={cn(
								"flex shrink-0 items-center px-3 text-foreground text-sm outline-hidden",
								"focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus/70",
								bordered && "border-border border-r last:border-r-0",
								pinned &&
									(selected
										? "bg-[color-mix(in_oklab,var(--nq-primary-soft),var(--nq-surface))]"
										: "bg-surface group-hover/row:bg-surface-2"),
								pinned === "start" && col.id === lastStartId && scrolled.start && edgeShadowStart,
								pinned === "end" && col.id === firstEndId && scrolled.end && edgeShadowEnd,
								numeric && "numeric",
								align === "end" && "justify-end text-right",
								align === "center" && "justify-center text-center",
								def?.className,
							)}
							style={{ width: `var(${cssVarName(col.id)})`, ...pinStyle(col) }}
						>
							<span className={cn("min-w-0", def?.truncate !== false && "truncate")}>
								<table.FlexRender cell={cell} />
							</span>
						</div>
					);
				})}
			</div>
		);
	};

	const virtualItems = shouldVirtualize ? virtualizer.getVirtualItems() : null;
	const pageCount = table.getPageCount();

	return (
		<div
			className={cn(
				"nq-datagrid flex min-w-0 flex-col bg-surface text-foreground",
				!bare && "overflow-hidden rounded-xl border border-border",
				className,
			)}
			data-density={density}
		>
			{toolbarOpts ? (
				<div className="flex flex-wrap items-center gap-2 border-border border-b px-3 py-2">
					{toolbarOpts.title ? (
						<div className="mr-2 font-semibold text-sm">{toolbarOpts.title}</div>
					) : null}
					{toolbarOpts.search ? (
						<SearchField
							aria-label="Search rows"
							size="sm"
							value={globalFilter}
							onChange={setGlobalFilter}
							className="w-56"
						/>
					) : null}
					{toolbarOpts.start}
					<span className="ml-auto numeric text-muted text-xs">
						{totalRows.toLocaleString()} {totalRows === 1 ? "row" : "rows"}
						{Object.keys(rowSelection).length > 0
							? ` · ${Object.keys(rowSelection).length} selected`
							: ""}
					</span>
					{toolbarOpts.columns ? (
						<MenuTrigger>
							<Button size="sm" variant="outline" color="neutral" startContent={<Columns3 />}>
								Columns
							</Button>
							<Menu
								selectionMode="multiple"
								selectedKeys={hideableColumns.filter((c) => c.getIsVisible()).map((c) => c.id)}
								onSelectionChange={(keys) => {
									const next: ColumnVisibilityState = {};
									for (const c of hideableColumns) next[c.id] = keys === "all" || keys.has(c.id);
									setColumnVisibility(next);
								}}
								popoverProps={{ placement: "bottom end" }}
							>
								{hideableColumns.map((c) => {
									const def = (c.columnDef.meta as { column?: DataGridColumn<T> } | undefined)
										?.column;
									const label = typeof def?.header === "string" ? def.header : c.id;
									return (
										<MenuItem key={c.id} id={c.id}>
											{label}
										</MenuItem>
									);
								})}
							</Menu>
						</MenuTrigger>
					) : null}
					{toolbarOpts.end}
				</div>
			) : null}
			<div
				ref={scrollRef}
				className="relative min-h-0 overflow-auto"
				style={scrollStyle}
				onKeyDown={onKeyDown}
				onBlur={onBlur}
				onScroll={onScroll}
			>
				{isLoading && data.length > 0 ? (
					<div className="sticky top-0 z-30 h-0.5 w-full overflow-hidden bg-primary-soft">
						<div className="h-full w-1/3 animate-indeterminate bg-primary" />
					</div>
				) : null}
				<div
					ref={gridRef}
					role="grid"
					aria-label={ariaLabel}
					aria-rowcount={totalRows + 1}
					aria-colcount={colCount}
					aria-multiselectable={selectionMode === "multiple" ? true : undefined}
					className="min-w-full"
					style={{ width: table.getTotalSize(), ...(widthVars as CSSProperties) }}
				>
					<div role="rowgroup" className={cn(stickyHeader && "sticky top-0 z-20")}>
						{table.getHeaderGroups().map((hg) => (
							<div key={hg.id} role="row" className="flex border-border border-b bg-surface-2">
								{hg.headers.map(renderHeader)}
							</div>
						))}
					</div>
					<div
						role="rowgroup"
						className="relative"
						style={shouldVirtualize ? { height: virtualizer.getTotalSize() } : undefined}
					>
						{showSkeleton
							? skeletonKeys.map((key) => (
									<div
										key={key}
										role="row"
										aria-hidden
										className="flex items-center gap-3 border-border border-b px-3"
										style={{ height: rowHeight }}
									>
										<Skeleton className="h-3 w-1/4" />
										<Skeleton className="h-3 w-1/6" />
										<Skeleton className="h-3 w-1/3" />
									</div>
								))
							: virtualItems
								? virtualItems.map((v) =>
										renderRow(rows[v.index] as Row<Features, T>, v.index, {
											position: "absolute",
											top: 0,
											left: 0,
											width: "100%",
											transform: `translateY(${v.start - virtualizer.options.scrollMargin}px)`,
										}),
									)
								: rows.map((row, i) => renderRow(row, i))}
					</div>
					{showFooter ? (
						<div role="rowgroup" className="sticky bottom-0 z-20">
							{table.getFooterGroups().map((fg) => (
								<div key={fg.id} role="row" className="flex border-border border-t bg-surface-2">
									{fg.headers.map((header) => {
										const def = (
											header.column.columnDef.meta as { column?: DataGridColumn<T> } | undefined
										)?.column;
										const numeric =
											def?.numeric ?? (def?.format ? NUMERIC_FORMATS.has(def.format) : false);
										return (
											<div
												key={header.id}
												role="gridcell"
												className={cn(
													"flex shrink-0 items-center px-3 font-medium text-xs",
													numeric && "numeric justify-end",
												)}
												style={{
													width: `var(${cssVarName(header.column.id)})`,
													height: headerHeight,
													...pinStyle(header.column),
												}}
											>
												{header.isPlaceholder ? null : <table.FlexRender footer={header} />}
											</div>
										);
									})}
								</div>
							))}
						</div>
					) : null}
				</div>
				{!showSkeleton && rows.length === 0 ? (
					<div className="sticky left-0 w-full">
						{emptyState ?? (
							<EmptyState
								size="sm"
								title="No rows"
								description={globalFilter ? "Try a different search." : undefined}
							/>
						)}
					</div>
				) : null}
			</div>
			{pagination && pageCount > 1 ? (
				<div className="flex flex-wrap items-center justify-between gap-2 border-border border-t px-3 py-2 text-muted text-xs">
					<span className="numeric">
						Page {pageIndex + 1} of {pageCount}
					</span>
					<Pagination
						page={pageIndex + 1}
						total={pageCount}
						onChange={(p) => table.setPageIndex(p - 1)}
					/>
				</div>
			) : null}
		</div>
	);
}
