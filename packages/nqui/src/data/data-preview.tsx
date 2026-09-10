import { Braces, Calendar, Hash, ToggleLeft, Type } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { Chip } from "../components/chip";
import { Tab, TabList, TabPanel, Tabs } from "../components/tabs";
import { cn } from "../utils/cn";
import { extent } from "../utils/extent";
import { formatBytes, formatCompact, formatNumber } from "../utils/format";
import { DataGrid, type DataGridColumn, type DataGridFormat } from "./data-grid";

export type PreviewType = "number" | "integer" | "string" | "boolean" | "date" | "json" | "null";

export interface ColumnStats {
	count: number;
	nulls: number;
	distinct?: number;
	min?: number | string;
	max?: number | string;
	mean?: number;
	/** Bucket counts for numeric columns. */
	histogram?: number[];
	/** Most frequent values for string columns. */
	top?: { value: string; count: number }[];
}

export interface DataPreviewColumn {
	name: string;
	type: PreviewType | string;
	nullable?: boolean;
	description?: string;
	stats?: ColumnStats;
}

const typeIcon: Record<PreviewType, ReactNode> = {
	number: <Hash />,
	integer: <Hash />,
	string: <Type />,
	boolean: <ToggleLeft />,
	date: <Calendar />,
	json: <Braces />,
	null: <Type />,
};

const typeColor: Record<PreviewType, "primary" | "neutral" | "warning" | "info" | "accent"> = {
	number: "primary",
	integer: "primary",
	string: "neutral",
	boolean: "warning",
	date: "info",
	json: "accent",
	null: "neutral",
};

function normalizeType(t: string): PreviewType {
	const s = t.toLowerCase();
	if (/int|bigint|smallint|serial/.test(s)) return "integer";
	if (/num|float|double|decimal|real|money/.test(s)) return "number";
	if (/bool/.test(s)) return "boolean";
	if (/date|time/.test(s)) return "date";
	if (/json|struct|array|map|object/.test(s)) return "json";
	if (s === "null") return "null";
	return "string";
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/;

function detect(v: unknown): PreviewType {
	if (v === null || v === undefined) return "null";
	if (typeof v === "number") return Number.isInteger(v) ? "integer" : "number";
	if (typeof v === "bigint") return "integer";
	if (typeof v === "boolean") return "boolean";
	if (v instanceof Date) return "date";
	if (typeof v === "string") return ISO_DATE.test(v) ? "date" : "string";
	return "json";
}

/** Infer column types and summary statistics from an array of records. */
export function inferSchema(
	rows: Record<string, unknown>[],
	options: { bins?: number; topN?: number } = {},
): DataPreviewColumn[] {
	const bins = options.bins ?? 12;
	const topN = options.topN ?? 5;
	const names = new Set<string>();
	for (const r of rows) for (const k of Object.keys(r)) names.add(k);
	return [...names].map((name) => {
		const values = rows.map((r) => r[name]);
		const nonNull = values.filter((v) => v !== null && v !== undefined);
		const typeCounts = new Map<PreviewType, number>();
		for (const v of nonNull) {
			const t = detect(v);
			typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1);
		}
		let type: PreviewType = "null";
		let best = 0;
		for (const [t, c] of typeCounts) {
			if (c > best) {
				best = c;
				type = t;
			}
		}
		if (typeCounts.has("number") && typeCounts.has("integer")) type = "number";
		const stats: ColumnStats = { count: values.length, nulls: values.length - nonNull.length };
		const distinct = new Set(
			nonNull.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))),
		);
		stats.distinct = distinct.size;
		if (type === "number" || type === "integer") {
			const nums = nonNull.map(Number).filter(Number.isFinite);
			if (nums.length) {
				const [min, max] = extent(nums) as [number, number];
				stats.min = min;
				stats.max = max;
				stats.mean = nums.reduce((a, b) => a + b, 0) / nums.length;
				const hist = new Array<number>(bins).fill(0);
				const span = max - min || 1;
				for (const n of nums) {
					const i = Math.min(bins - 1, Math.floor(((n - min) / span) * bins));
					hist[i] = (hist[i] ?? 0) + 1;
				}
				stats.histogram = hist;
			}
		} else if (type === "date") {
			const times = nonNull
				.map((v) => (v instanceof Date ? v : new Date(String(v))).getTime())
				.filter(Number.isFinite);
			if (times.length) {
				const [minT, maxT] = extent(times) as [number, number];
				stats.min = new Date(minT).toISOString();
				stats.max = new Date(maxT).toISOString();
			}
		} else if (type === "string" || type === "boolean") {
			const counts = new Map<string, number>();
			for (const v of nonNull) {
				const k = String(v);
				counts.set(k, (counts.get(k) ?? 0) + 1);
			}
			stats.top = [...counts.entries()]
				.sort((a, b) => b[1] - a[1])
				.slice(0, topN)
				.map(([value, count]) => ({ value, count }));
			if (type === "string") {
				const [minLen, maxLen] = extent(nonNull.map((v) => String(v).length)) ?? [0, 0];
				stats.min = minLen;
				stats.max = maxLen;
			}
		}
		return { name, type, nullable: stats.nulls > 0, stats };
	});
}

function formatFor(type: PreviewType): DataGridFormat | undefined {
	switch (type) {
		case "number":
			return "number";
		case "integer":
			return "integer";
		case "boolean":
			return "boolean";
		case "date":
			return "datetime";
		default:
			return undefined;
	}
}

function MiniHistogram({ bins }: { bins: number[] }) {
	const max = Math.max(...bins, 1);
	const bars = bins.map((count, i) => ({ id: `bin-${i}`, count }));
	return (
		<span className="flex h-5 items-end gap-px" aria-hidden>
			{bars.map((bar) => (
				<span
					key={bar.id}
					className="w-1 rounded-[1px] bg-primary/70"
					style={{ height: `${Math.max(8, (bar.count / max) * 100)}%` }}
				/>
			))}
		</span>
	);
}

function NullBar({ ratio }: { ratio: number }) {
	return (
		<span className="flex items-center gap-2">
			<span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-3">
				<span
					className={cn(
						"block h-full rounded-full",
						ratio > 0.5 ? "bg-danger" : ratio > 0.1 ? "bg-warning" : "bg-success",
					)}
					style={{ width: `${ratio * 100}%` }}
				/>
			</span>
			<span className="numeric text-muted text-xs">{(ratio * 100).toFixed(1)}%</span>
		</span>
	);
}

export function TypeChip({ type }: { type: string }) {
	const t = normalizeType(type);
	return (
		<Chip size="sm" color={typeColor[t]} startContent={typeIcon[t]} className="font-mono">
			{type}
		</Chip>
	);
}

export interface DataPreviewProps {
	/** Column metadata; inferred from `rows` when omitted. */
	columns?: DataPreviewColumn[];
	rows: Record<string, unknown>[];
	title?: ReactNode;
	description?: ReactNode;
	/** Rows shown in the sample tab. */
	sampleSize?: number;
	/** Total row count when `rows` is only a sample. */
	totalRows?: number;
	/** Bytes, shown in the summary. */
	sizeBytes?: number;
	defaultTab?: "sample" | "schema";
	height?: number | string;
	className?: string;
	onColumnAction?: (column: DataPreviewColumn) => void;
}

/** Dataset explorer: summary strip, sample rows, and per-column schema with stats. */
export function DataPreview({
	columns: columnsProp,
	rows,
	title,
	description,
	sampleSize = 100,
	totalRows,
	sizeBytes,
	defaultTab = "sample",
	height = 420,
	className,
	onColumnAction,
}: DataPreviewProps) {
	const columns = useMemo(() => columnsProp ?? inferSchema(rows), [columnsProp, rows]);
	const sample = useMemo(() => rows.slice(0, sampleSize), [rows, sampleSize]);
	const gridColumns = useMemo<DataGridColumn<Record<string, unknown>>[]>(
		() =>
			columns.map((c) => ({
				accessorKey: c.name,
				header: c.name,
				format: formatFor(normalizeType(c.type)),
				size: normalizeType(c.type) === "json" ? 240 : 150,
			})),
		[columns],
	);
	const schemaColumns = useMemo<DataGridColumn<DataPreviewColumn>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Column",
				size: 200,
				pinned: "start",
				cell: ({ value }) => (
					<span className="font-mono font-medium text-foreground">{String(value)}</span>
				),
			},
			{
				accessorKey: "type",
				header: "Type",
				size: 130,
				cell: ({ value }) => <TypeChip type={String(value)} />,
			},
			{
				id: "nulls",
				header: "Nulls",
				size: 150,
				enableSorting: true,
				accessorFn: (c) => (c.stats ? c.stats.nulls / Math.max(1, c.stats.count) : 0),
				cell: ({ value }) => <NullBar ratio={Number(value)} />,
			},
			{
				id: "distinct",
				header: "Distinct",
				format: "integer",
				size: 100,
				accessorFn: (c) => c.stats?.distinct,
			},
			{
				id: "min",
				header: "Min",
				size: 130,
				numeric: true,
				accessorFn: (c) => c.stats?.min,
				cell: ({ value }) =>
					typeof value === "number"
						? formatNumber(value)
						: value
							? String(value).slice(0, 19)
							: "–",
			},
			{
				id: "max",
				header: "Max",
				size: 130,
				numeric: true,
				accessorFn: (c) => c.stats?.max,
				cell: ({ value }) =>
					typeof value === "number"
						? formatNumber(value)
						: value
							? String(value).slice(0, 19)
							: "–",
			},
			{ id: "mean", header: "Mean", format: "number", size: 110, accessorFn: (c) => c.stats?.mean },
			{
				id: "dist",
				header: "Distribution",
				size: 180,
				enableSorting: false,
				accessorFn: (c) => c.stats,
				cell: ({ row }) =>
					row.stats?.histogram ? (
						<MiniHistogram bins={row.stats.histogram} />
					) : row.stats?.top ? (
						<span className="flex gap-1 overflow-hidden">
							{row.stats.top.slice(0, 3).map((t) => (
								<Chip key={t.value} size="sm" variant="outline" className="max-w-24">
									<span className="truncate">{t.value}</span>
									<span className="text-subtle">{t.count}</span>
								</Chip>
							))}
						</span>
					) : null,
			},
			{ accessorKey: "description", header: "Description", size: 220 },
		],
		[],
	);
	const total = totalRows ?? rows.length;
	const nullCells = columns.reduce((a, c) => a + (c.stats?.nulls ?? 0), 0);
	const cells = columns.reduce((a, c) => a + (c.stats?.count ?? 0), 0);

	return (
		<div
			className={cn(
				"flex flex-col overflow-hidden rounded-xl border border-border bg-surface",
				className,
			)}
		>
			<div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-border border-b px-4 py-2">
				{title || description ? (
					<div className="mr-auto min-w-0">
						{title ? <div className="font-semibold text-foreground text-sm">{title}</div> : null}
						{description ? <div className="text-muted text-xs">{description}</div> : null}
					</div>
				) : null}
				<Summary label="Rows" value={formatCompact(total)} />
				<Summary label="Columns" value={String(columns.length)} />
				{cells > 0 ? (
					<Summary label="Null cells" value={`${((nullCells / cells) * 100).toFixed(1)}%`} />
				) : null}
				{sizeBytes !== undefined ? <Summary label="Size" value={formatBytes(sizeBytes)} /> : null}
			</div>
			<Tabs defaultSelectedKey={defaultTab} variant="segmented" size="sm" className="gap-0">
				<div className="flex items-center justify-between gap-2 px-4 pt-2 pb-1">
					<TabList aria-label="Preview sections">
						<Tab id="sample">Sample</Tab>
						<Tab id="schema">Schema</Tab>
					</TabList>
					<span className="numeric text-muted text-xs">
						showing {sample.length.toLocaleString()} of {total.toLocaleString()}
					</span>
				</div>
				<TabPanel id="sample">
					<DataGrid
						bare
						density="compact"
						columns={gridColumns}
						data={sample}
						height={height}
						enableResizing
						virtualize="auto"
					/>
				</TabPanel>
				<TabPanel id="schema">
					<DataGrid
						bare
						density="compact"
						columns={schemaColumns}
						data={columns}
						height={height}
						getRowId={(c) => c.name}
						onRowAction={onColumnAction}
						enableResizing
					/>
				</TabPanel>
			</Tabs>
		</div>
	);
}

function Summary({ label, value }: { label: string; value: string }) {
	return (
		<span className="flex flex-col">
			<span className="text-subtle text-xs uppercase tracking-wide">{label}</span>
			<span className="numeric font-medium text-foreground text-sm">{value}</span>
		</span>
	);
}
