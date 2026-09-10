import { Database } from "lucide-react";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { Alert } from "../components/alert";
import { Chip } from "../components/chip";
import { EmptyState } from "../components/empty-state";
import { DataGrid, type DataGridColumn } from "../data/data-grid";
import { cn } from "../utils/cn";
import { formatDuration } from "../utils/format";
import { SqlEditor, type SqlEditorHandle, type SqlEditorProps } from "./sql-editor";

export interface QueryColumn {
	name: string;
	type?: string;
}

export interface QueryResult {
	columns: QueryColumn[];
	rows: Record<string, unknown>[];
	/** Total rows when `rows` is truncated. */
	rowCount?: number;
	elapsedMs?: number;
	/** Informational message, e.g. "12 rows affected". */
	message?: string;
}

export interface QueryWorkbenchProps
	extends Omit<SqlEditorProps, "onRun" | "toolbar" | "isRunning"> {
	/** Execute the query and resolve the result; reject or throw to show an error. */
	onRun: (query: string) => Promise<QueryResult>;
	/** Height of the results pane. */
	resultsHeight?: number;
	/** Content shown in the toolbar, e.g. a connection picker. */
	toolbarContent?: ReactNode;
	/** Callback when a result row is double-clicked. */
	onRowAction?: (row: Record<string, unknown>) => void;
}

function formatFor(type?: string): DataGridColumn<Record<string, unknown>>["format"] {
	const t = type?.toLowerCase() ?? "";
	if (/int|serial/.test(t)) return "integer";
	if (/num|float|double|decimal|real/.test(t)) return "number";
	if (/bool/.test(t)) return "boolean";
	if (/timestamp|datetime/.test(t)) return "datetime";
	if (/date/.test(t)) return "date";
	return undefined;
}

/**
 * Numbers query runs so a slow, older run cannot overwrite the result of a newer one.
 * `start()` returns a ticket; only the most recently started ticket `isLatest`.
 */
export function createRunSequencer() {
	let latest = 0;
	return {
		start: () => ++latest,
		isLatest: (ticket: number) => ticket === latest,
	};
}

/** Editor above, results grid below, status line in between. */
export function QueryWorkbench({
	onRun,
	resultsHeight = 320,
	toolbarContent,
	onRowAction,
	className,
	minHeight = 140,
	...editorProps
}: QueryWorkbenchProps) {
	const editorRef = useRef<SqlEditorHandle>(null);
	const [result, setResult] = useState<QueryResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [running, setRunning] = useState(false);
	const [columns, setColumns] = useState<DataGridColumn<Record<string, unknown>>[]>([]);
	const runs = useRef(createRunSequencer());

	const run = useCallback(
		async (query: string) => {
			const ticket = runs.current.start();
			setRunning(true);
			setError(null);
			try {
				const res = await onRun(query);
				// A newer run has started since; its result is the one that counts.
				if (!runs.current.isLatest(ticket)) return;
				setResult(res);
				setColumns(
					res.columns.map((c) => ({
						accessorKey: c.name,
						header: c.name,
						format: formatFor(c.type),
						size: 160,
					})),
				);
			} catch (e) {
				if (!runs.current.isLatest(ticket)) return;
				setError(e instanceof Error ? e.message : String(e));
			} finally {
				if (runs.current.isLatest(ticket)) setRunning(false);
			}
		},
		[onRun],
	);

	return (
		<div className={cn("flex flex-col gap-4", className)}>
			<SqlEditor
				{...editorProps}
				ref={editorRef}
				minHeight={minHeight}
				toolbar
				toolbarContent={toolbarContent}
				onRun={run}
				isRunning={running}
			/>
			{error ? (
				<Alert
					color="danger"
					title="Query failed"
					description={<span className="font-mono text-xs">{error}</span>}
					onClose={() => setError(null)}
				/>
			) : null}
			<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
				<div className="flex min-h-8 items-center gap-2 border-border border-b px-4 py-1 text-muted text-xs">
					<span className="font-medium text-foreground">Results</span>
					{result ? (
						<>
							<Chip size="sm" variant="soft" color="neutral" className="numeric">
								{(result.rowCount ?? result.rows.length).toLocaleString()} rows
							</Chip>
							{result.elapsedMs !== undefined ? (
								<span className="numeric">{formatDuration(result.elapsedMs)}</span>
							) : null}
							{result.message ? <span>{result.message}</span> : null}
						</>
					) : null}
				</div>
				{result && result.columns.length > 0 ? (
					<DataGrid
						bare
						density="compact"
						columns={columns}
						data={result.rows}
						height={resultsHeight}
						enableResizing
						virtualize="auto"
						onRowAction={onRowAction}
						isLoading={running}
					/>
				) : (
					<div style={{ height: resultsHeight }} className="flex items-center justify-center">
						<EmptyState
							size="sm"
							icon={<Database />}
							title={running ? "Running…" : "No results yet"}
							description={running ? undefined : "Run a query with ⌘↵ to see rows here."}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
