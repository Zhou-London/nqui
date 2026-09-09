import { Check, ChevronRight, Copy } from "lucide-react";
import { type ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { cn } from "../utils/cn";

export interface JsonViewerProps extends Omit<ComponentProps<"div">, "children"> {
	value: unknown;
	/** Levels expanded on first render. */
	defaultExpandDepth?: number;
	/** Show a copy button for the whole document. */
	copyable?: boolean;
	/** Array/object children beyond this count are hidden behind a "more" toggle. */
	collapseAfter?: number;
	/** Root label, e.g. the variable name. */
	name?: string;
}

type Path = string;

function isPlainObject(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

function Primitive({ value }: { value: unknown }) {
	if (value === null) return <span className="text-syntax-keyword">null</span>;
	switch (typeof value) {
		case "string":
			return <span className="text-syntax-string">{JSON.stringify(value)}</span>;
		case "number":
		case "bigint":
			return <span className="text-syntax-number numeric">{String(value)}</span>;
		case "boolean":
			return <span className="text-syntax-keyword">{String(value)}</span>;
		case "undefined":
			return <span className="text-syntax-comment">undefined</span>;
		default:
			return <span className="text-syntax-comment">{String(value)}</span>;
	}
}

interface NodeProps {
	name?: string;
	value: unknown;
	path: Path;
	depth: number;
	expanded: Set<Path>;
	toggle: (path: Path) => void;
	collapseAfter: number;
	isLast: boolean;
}

function Node({ name, value, path, depth, expanded, toggle, collapseAfter, isLast }: NodeProps) {
	const [showAll, setShowAll] = useState(false);
	const isArray = Array.isArray(value);
	const isObject = isPlainObject(value);
	const entries: [string, unknown][] = isArray
		? (value as unknown[]).map((v, i) => [String(i), v])
		: isObject
			? Object.entries(value)
			: [];
	const isContainer = isArray || isObject;
	const isOpen = expanded.has(path);
	const visible = showAll ? entries : entries.slice(0, collapseAfter);
	const hidden = entries.length - visible.length;
	const label = name !== undefined ? <span className="text-syntax-variable">{name}</span> : null;
	const comma = isLast ? null : <span className="text-syntax-punctuation">,</span>;

	if (!isContainer) {
		return (
			<div
				role="treeitem"
				aria-level={depth + 1}
				tabIndex={-1}
				className="flex items-start gap-1 whitespace-pre"
				style={{ paddingInlineStart: depth * 16 }}
			>
				{label ? (
					<>
						{label}
						<span className="text-syntax-punctuation">: </span>
					</>
				) : null}
				<Primitive value={value} />
				{comma}
			</div>
		);
	}

	const open = isArray ? "[" : "{";
	const close = isArray ? "]" : "}";
	return (
		<div role="treeitem" aria-expanded={isOpen} aria-level={depth + 1} tabIndex={-1}>
			<div
				className="flex items-center gap-1 whitespace-pre"
				style={{ paddingInlineStart: depth * 16 }}
			>
				<Button
					onPress={() => toggle(path)}
					aria-label={isOpen ? "Collapse" : "Expand"}
					className="-ml-4 flex size-4 items-center justify-center rounded-sm text-subtle outline-hidden hover:text-foreground"
				>
					<ChevronRight className={cn("size-3.5 transition-transform", isOpen && "rotate-90")} />
				</Button>
				{label ? (
					<>
						{label}
						<span className="text-syntax-punctuation">: </span>
					</>
				) : null}
				<span className="text-syntax-punctuation">{open}</span>
				{!isOpen ? (
					<>
						<button
							type="button"
							onClick={() => toggle(path)}
							className="rounded-sm px-1 text-subtle text-xs hover:bg-surface-2"
						>
							{entries.length} {isArray ? "items" : "keys"}
						</button>
						<span className="text-syntax-punctuation">{close}</span>
						{comma}
					</>
				) : null}
			</div>
			{isOpen ? (
				// biome-ignore lint/a11y/useSemanticElements: ARIA tree children must be a role="group", not a fieldset
				<div role="group">
					{visible.map(([k, v], i) => (
						<Node
							key={k}
							name={isArray ? undefined : k}
							value={v}
							path={`${path}.${k}`}
							depth={depth + 1}
							expanded={expanded}
							toggle={toggle}
							collapseAfter={collapseAfter}
							isLast={i === entries.length - 1}
						/>
					))}
					{hidden > 0 ? (
						<button
							type="button"
							onClick={() => setShowAll(true)}
							className="rounded-sm px-1 text-primary-text text-xs hover:underline"
							style={{ marginInlineStart: (depth + 1) * 16 }}
						>
							… {hidden} more
						</button>
					) : null}
					<div className="whitespace-pre" style={{ paddingInlineStart: depth * 16 }}>
						<span className="text-syntax-punctuation">{close}</span>
						{comma}
					</div>
				</div>
			) : null}
		</div>
	);
}

function collectPaths(
	value: unknown,
	path: Path,
	depth: number,
	maxDepth: number,
	out: Set<Path>,
): void {
	if (depth >= maxDepth) return;
	if (Array.isArray(value)) {
		out.add(path);
		for (let i = 0; i < value.length; i++)
			collectPaths(value[i], `${path}.${i}`, depth + 1, maxDepth, out);
	} else if (isPlainObject(value)) {
		out.add(path);
		for (const [k, v] of Object.entries(value))
			collectPaths(v, `${path}.${k}`, depth + 1, maxDepth, out);
	}
}

/** Collapsible, syntax-colored JSON tree for API payloads, row details, and configs. */
export function JsonViewer({
	value,
	defaultExpandDepth = 2,
	copyable = true,
	collapseAfter = 100,
	name,
	className,
	...props
}: JsonViewerProps) {
	const [expanded, setExpanded] = useState<Set<Path>>(() => {
		const s = new Set<Path>();
		collectPaths(value, "$", 0, defaultExpandDepth, s);
		return s;
	});
	const [copied, setCopied] = useState(false);
	const copiedTimer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(copiedTimer.current), []);
	const toggle = useCallback((path: Path) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(path)) next.delete(path);
			else next.add(path);
			return next;
		});
	}, []);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
			setCopied(true);
			window.clearTimeout(copiedTimer.current);
			copiedTimer.current = window.setTimeout(() => setCopied(false), 1500);
		} catch {
			// Clipboard blocked; nothing else to do.
		}
	};
	return (
		<div
			{...props}
			className={cn(
				"group/json relative overflow-auto rounded-xl border border-border bg-surface p-3 pl-7 font-mono text-foreground text-xs leading-5",
				className,
			)}
		>
			{copyable ? (
				<Button
					onPress={copy}
					aria-label="Copy JSON"
					className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-md text-muted opacity-0 outline-hidden transition-opacity hover:bg-surface-2 hover:text-foreground focus-visible:opacity-100 group-hover/json:opacity-100"
				>
					{copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
				</Button>
			) : null}
			<div role="tree" aria-label={name ?? "JSON"}>
				<Node
					name={name}
					value={value}
					path="$"
					depth={0}
					expanded={expanded}
					toggle={toggle}
					collapseAfter={collapseAfter}
					isLast
				/>
			</div>
		</div>
	);
}
