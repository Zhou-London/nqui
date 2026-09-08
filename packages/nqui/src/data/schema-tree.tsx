import {
	ChevronRight,
	Columns3,
	Database,
	Eye,
	Folder,
	Hash,
	Key,
	Table2,
	Type,
} from "lucide-react";
import { type ReactNode, useMemo } from "react";
import {
	Tree as AriaTree,
	TreeItem as AriaTreeItem,
	type TreeProps as AriaTreeProps,
	Button,
	Collection,
	TreeItemContent,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRingInset } from "../utils/focus-ring";

export type SchemaNodeKind = "database" | "schema" | "table" | "view" | "column" | "folder";

export interface SchemaNode {
	id: string;
	name: string;
	kind: SchemaNodeKind;
	/** Column data type, shown muted on the right. */
	dataType?: string;
	/** Marks primary-key columns. */
	isPrimaryKey?: boolean;
	/** Row count or other short badge. */
	badge?: ReactNode;
	children?: SchemaNode[];
}

const icons: Record<SchemaNodeKind, ReactNode> = {
	database: <Database />,
	schema: <Folder />,
	folder: <Folder />,
	table: <Table2 />,
	view: <Eye />,
	column: <Columns3 />,
};

function columnIcon(node: SchemaNode): ReactNode {
	if (node.isPrimaryKey) return <Key className="text-warning" />;
	const t = node.dataType?.toLowerCase() ?? "";
	if (/int|numeric|decimal|float|double|real|number|bigint/.test(t)) return <Hash />;
	if (/char|text|string|uuid/.test(t)) return <Type />;
	return icons.column;
}

export interface SchemaTreeProps
	extends Omit<AriaTreeProps<SchemaNode>, "children" | "items" | "className"> {
	nodes: SchemaNode[];
	/** Case-insensitive filter; ancestors of matches stay visible. */
	filter?: string;
	className?: string;
	/** Double-click or Enter. */
	onAction?: (key: React.Key) => void;
}

function filterNodes(nodes: SchemaNode[], q: string): SchemaNode[] {
	if (!q) return nodes;
	const out: SchemaNode[] = [];
	for (const n of nodes) {
		const kids = n.children ? filterNodes(n.children, q) : [];
		if (n.name.toLowerCase().includes(q) || kids.length > 0)
			out.push({ ...n, children: n.children ? kids : undefined });
	}
	return out;
}

function collectIds(nodes: SchemaNode[], out: string[] = []): string[] {
	for (const n of nodes) {
		if (n.children?.length) {
			out.push(n.id);
			collectIds(n.children, out);
		}
	}
	return out;
}

/** Database explorer tree: databases, schemas, tables, and typed columns. */
export function SchemaTree({
	nodes,
	filter,
	className,
	selectionMode = "single",
	...props
}: SchemaTreeProps) {
	const q = filter?.trim().toLowerCase() ?? "";
	const visible = useMemo(() => filterNodes(nodes, q), [nodes, q]);
	const expandedWhenFiltering = useMemo(
		() => (q ? new Set(collectIds(visible)) : undefined),
		[visible, q],
	);

	const renderItem = (node: SchemaNode) => (
		<AriaTreeItem
			id={node.id}
			textValue={node.name}
			className={cn(
				focusRingInset(),
				"group/node flex cursor-default items-center gap-1 rounded-lg py-1 pr-2 text-sm hover:bg-surface-2 selected:bg-accent-soft",
			)}
		>
			<TreeItemContent>
				{({ hasChildItems, isExpanded, level }) => (
					<span
						className="flex min-w-0 flex-1 items-center gap-1.5"
						style={{ paddingInlineStart: (level - 1) * 14 + 4 }}
					>
						<Button
							slot="chevron"
							className={cn(
								"flex size-5 shrink-0 items-center justify-center rounded-sm text-subtle outline-hidden hover:text-foreground",
								!hasChildItems && "invisible",
							)}
						>
							<ChevronRight
								className={cn("size-3.5 transition-transform", isExpanded && "rotate-90")}
							/>
						</Button>
						<span className="shrink-0 text-muted [&_svg]:size-4">
							{node.kind === "column" ? columnIcon(node) : icons[node.kind]}
						</span>
						<span className="truncate text-foreground">{node.name}</span>
						{node.dataType ? (
							<span className="ml-1 truncate font-mono text-2xs text-subtle">{node.dataType}</span>
						) : null}
						{node.badge ? (
							<span className="ml-auto shrink-0 text-2xs text-subtle">{node.badge}</span>
						) : null}
					</span>
				)}
			</TreeItemContent>
			{node.children ? <Collection items={node.children}>{renderItem}</Collection> : null}
		</AriaTreeItem>
	);

	return (
		<AriaTree
			aria-label="Schema"
			{...props}
			selectionMode={selectionMode}
			items={visible}
			expandedKeys={expandedWhenFiltering ?? props.expandedKeys}
			className={cn("flex flex-col gap-px overflow-auto p-1 outline-hidden", className)}
			renderEmptyState={() => <div className="p-4 text-center text-muted text-sm">No matches.</div>}
		>
			{renderItem}
		</AriaTree>
	);
}
