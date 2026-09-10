import {
	autocompletion,
	closeBrackets,
	closeBracketsKeymap,
	completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
	Cassandra,
	MariaSQL,
	MSSQL,
	MySQL,
	PLSQL,
	PostgreSQL,
	type SQLDialect,
	SQLite,
	type SQLNamespace,
	StandardSQL,
	sql,
} from "@codemirror/lang-sql";
import { bracketMatching, foldGutter, indentOnInput } from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import {
	placeholder as cmPlaceholder,
	drawSelection,
	EditorView,
	highlightActiveLine,
	highlightActiveLineGutter,
	keymap,
	lineNumbers,
} from "@codemirror/view";
import { Play } from "lucide-react";
import {
	type CSSProperties,
	type ReactNode,
	type Ref,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
} from "react";
import { Button } from "../components/button";
import { Kbd } from "../components/kbd";
import { cn } from "../utils/cn";
import { minimalChange } from "./diff";
import { nquiEditorTheme, nquiSyntax } from "./theme";

export type SqlDialectName =
	| "postgresql"
	| "mysql"
	| "mariadb"
	| "sqlite"
	| "mssql"
	| "cassandra"
	| "plsql"
	| "standard";

export const dialects: Record<SqlDialectName, SQLDialect> = {
	postgresql: PostgreSQL,
	mysql: MySQL,
	mariadb: MariaSQL,
	sqlite: SQLite,
	mssql: MSSQL,
	cassandra: Cassandra,
	plsql: PLSQL,
	standard: StandardSQL,
};

export type { SQLNamespace };

export interface SqlEditorHandle {
	view: EditorView | null;
	/** Current document text. */
	getValue: () => string;
	/** Selected text, or empty. */
	getSelection: () => string;
	setValue: (value: string) => void;
	focus: () => void;
}

export interface SqlEditorProps {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	dialect?: SqlDialectName;
	/**
	 * Tables and columns for completion, e.g. `{ public: { orders: ["id", "amount"] } }`
	 * or `{ orders: ["id", "amount"] }`. Compared by content, so an inline literal is fine,
	 * but memoize large schemas: each change is serialized to detect it.
	 */
	schema?: SQLNamespace;
	defaultTable?: string;
	defaultSchema?: string;
	upperCaseKeywords?: boolean;
	placeholder?: string;
	readOnly?: boolean;
	lineNumbers?: boolean;
	lineWrapping?: boolean;
	autoFocus?: boolean;
	minHeight?: number | string;
	maxHeight?: number | string;
	/** Cmd/Ctrl+Enter. Receives the selection when text is selected, otherwise the whole document. */
	onRun?: (query: string, isSelection: boolean) => void;
	/** Cmd/Ctrl+S. */
	onSave?: (value: string) => void;
	/**
	 * Extra CodeMirror extensions appended after the defaults. Memoize the array (`useMemo` or a
	 * module constant): a new array identity reconfigures the editor on every render.
	 */
	extensions?: Extension[];
	/** Show the built-in toolbar with a Run button. */
	toolbar?: boolean;
	/** Content placed in the toolbar between the left slot and the Run button. */
	toolbarContent?: ReactNode;
	isRunning?: boolean;
	className?: string;
	ref?: Ref<SqlEditorHandle>;
}

/** SQL editor on CodeMirror 6 with schema-aware completion and NQUI theming. */
export function SqlEditor({
	value,
	defaultValue = "",
	onChange,
	dialect = "postgresql",
	schema,
	defaultTable,
	defaultSchema,
	upperCaseKeywords = true,
	placeholder,
	readOnly = false,
	lineNumbers: showLineNumbers = true,
	lineWrapping = false,
	autoFocus = false,
	minHeight = 160,
	maxHeight,
	onRun,
	onSave,
	extensions,
	toolbar = false,
	toolbarContent,
	isRunning = false,
	className,
	ref,
}: SqlEditorProps) {
	const hostRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const compartments = useRef({
		language: new Compartment(),
		readOnly: new Compartment(),
		wrap: new Compartment(),
		gutter: new Compartment(),
		keys: new Compartment(),
		extra: new Compartment(),
		placeholder: new Compartment(),
	});
	const callbacks = useRef({ onChange, onRun, onSave });
	useLayoutEffect(() => {
		callbacks.current = { onChange, onRun, onSave };
	});
	// Schemas are compared by content so callers need not keep a stable reference.
	const schemaKey = schema === undefined ? "" : JSON.stringify(schema);

	const languageExt = () =>
		sql({ dialect: dialects[dialect], schema, defaultTable, defaultSchema, upperCaseKeywords });
	const runKeymap = () =>
		keymap.of([
			{
				key: "Mod-Enter",
				run: (view) => {
					const sel = view.state.selection.main;
					const selected = sel.empty ? "" : view.state.sliceDoc(sel.from, sel.to);
					callbacks.current.onRun?.(selected || view.state.doc.toString(), Boolean(selected));
					return true;
				},
			},
			{
				key: "Mod-s",
				run: (view) => {
					callbacks.current.onSave?.(view.state.doc.toString());
					return Boolean(callbacks.current.onSave);
				},
			},
		]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: the editor mounts once; props sync below
	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		const c = compartments.current;
		const state = EditorState.create({
			doc: value ?? defaultValue,
			extensions: [
				c.gutter.of(
					showLineNumbers ? [lineNumbers(), highlightActiveLineGutter(), foldGutter()] : [],
				),
				history(),
				drawSelection(),
				indentOnInput(),
				bracketMatching(),
				closeBrackets(),
				autocompletion(),
				highlightActiveLine(),
				highlightSelectionMatches(),
				c.keys.of(runKeymap()),
				keymap.of([
					...closeBracketsKeymap,
					...defaultKeymap,
					...searchKeymap,
					...historyKeymap,
					...completionKeymap,
					indentWithTab,
				]),
				nquiEditorTheme,
				nquiSyntax,
				c.language.of(languageExt()),
				c.readOnly.of([EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]),
				c.wrap.of(lineWrapping ? EditorView.lineWrapping : []),
				c.placeholder.of(placeholder ? cmPlaceholder(placeholder) : []),
				c.extra.of(extensions ?? []),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) callbacks.current.onChange?.(update.state.doc.toString());
				}),
			],
		});
		const view = new EditorView({ state, parent: host });
		viewRef.current = view;
		if (autoFocus) view.focus();
		return () => {
			view.destroy();
			viewRef.current = null;
		};
	}, []);

	// Controlled value: replace only the span that differs so the cursor and selection survive.
	useEffect(() => {
		const view = viewRef.current;
		if (!view || value === undefined) return;
		const changes = minimalChange(view.state.doc.toString(), value);
		if (changes) view.dispatch({ changes });
	}, [value]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: schemaKey stands in for schema; languageExt reads current props
	useEffect(() => {
		viewRef.current?.dispatch({
			effects: compartments.current.language.reconfigure(languageExt()),
		});
	}, [dialect, schemaKey, defaultTable, defaultSchema, upperCaseKeywords]);

	useEffect(() => {
		viewRef.current?.dispatch({
			effects: compartments.current.placeholder.reconfigure(
				placeholder ? cmPlaceholder(placeholder) : [],
			),
		});
	}, [placeholder]);

	useEffect(() => {
		viewRef.current?.dispatch({
			effects: compartments.current.readOnly.reconfigure([
				EditorState.readOnly.of(readOnly),
				EditorView.editable.of(!readOnly),
			]),
		});
	}, [readOnly]);

	useEffect(() => {
		viewRef.current?.dispatch({
			effects: compartments.current.wrap.reconfigure(lineWrapping ? EditorView.lineWrapping : []),
		});
	}, [lineWrapping]);

	useEffect(() => {
		viewRef.current?.dispatch({
			effects: compartments.current.gutter.reconfigure(
				showLineNumbers ? [lineNumbers(), highlightActiveLineGutter(), foldGutter()] : [],
			),
		});
	}, [showLineNumbers]);

	useEffect(() => {
		viewRef.current?.dispatch({
			effects: compartments.current.extra.reconfigure(extensions ?? []),
		});
	}, [extensions]);

	useImperativeHandle(
		ref,
		() => ({
			get view() {
				return viewRef.current;
			},
			getValue: () => viewRef.current?.state.doc.toString() ?? "",
			getSelection: () => {
				const v = viewRef.current;
				if (!v) return "";
				const sel = v.state.selection.main;
				return sel.empty ? "" : v.state.sliceDoc(sel.from, sel.to);
			},
			setValue: (next: string) => {
				const v = viewRef.current;
				if (!v) return;
				v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: next } });
			},
			focus: () => viewRef.current?.focus(),
		}),
		[],
	);

	const run = () => {
		const v = viewRef.current;
		if (!v) return;
		const sel = v.state.selection.main;
		const selected = sel.empty ? "" : v.state.sliceDoc(sel.from, sel.to);
		onRun?.(selected || v.state.doc.toString(), Boolean(selected));
	};

	return (
		<div
			className={cn(
				"flex flex-col overflow-hidden rounded-xl border border-border bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
				className,
			)}
		>
			{toolbar ? (
				<div className="flex items-center gap-2 border-border border-b bg-surface-2/60 px-2 py-1">
					<span className="px-1 font-mono text-muted text-xs uppercase">{dialect}</span>
					{toolbarContent}
					<div className="ml-auto flex items-center gap-2">
						<Kbd size="sm" keys={["cmd", "enter"]} />
						<Button
							size="sm"
							color="primary"
							onPress={run}
							isPending={isRunning}
							isDisabled={!onRun}
							startContent={<Play />}
						>
							Run
						</Button>
					</div>
				</div>
			) : null}
			<div
				ref={hostRef}
				className="overflow-auto [&_.cm-editor]:min-h-(--nq-sql-min) [&_.cm-editor]:max-h-(--nq-sql-max)"
				style={
					{
						"--nq-sql-min": typeof minHeight === "number" ? `${minHeight}px` : minHeight,
						"--nq-sql-max":
							maxHeight === undefined
								? "none"
								: typeof maxHeight === "number"
									? `${maxHeight}px`
									: maxHeight,
					} as CSSProperties
				}
			/>
		</div>
	);
}
