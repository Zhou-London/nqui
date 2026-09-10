import { Check, Copy, Link as LinkIcon } from "lucide-react";
import {
	type ComponentProps,
	isValidElement,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import ReactMarkdown, { type Components, type Options } from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { IconButton } from "../components/button";
import { cn } from "../utils/cn";
import { markdownComponents } from "./markdown";

/*
 * `MarkdownViewer` is the reading view for a whole document: a README, a runbook, a
 * generated report. It draws no surface of its own, so the text sits directly on whatever
 * background the page has, and it lays every block out in normal flow, so the browser's
 * find, print, and anchor navigation all work on the full document.
 */

type Plugins = NonNullable<Options["remarkPlugins"]>;

const remarkPlugins: Plugins = [remarkGfm];
const rehypePlugins: Plugins = [rehypeSlug];

interface HeadingProps extends ComponentProps<"h1"> {
	node?: unknown;
}

function heading(Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6", base: string) {
	return function Heading({ node: _n, id, className, children, ...p }: HeadingProps) {
		return (
			<Tag {...p} id={id} className={cn("group/heading scroll-mt-16", base, className)}>
				{children}
				{id ? (
					<a
						href={`#${id}`}
						aria-label="Link to this section"
						className="ml-2 inline-flex align-middle text-subtle opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/heading:opacity-100 [&_svg]:size-4"
					>
						<LinkIcon aria-hidden />
					</a>
				) : null}
			</Tag>
		);
	};
}

interface PreProps extends ComponentProps<"pre"> {
	node?: unknown;
}

/** Fenced code with a language tag and a copy button. */
function CodeBlock({ node: _n, className, children, ...p }: PreProps) {
	const ref = useRef<HTMLPreElement>(null);
	const [copied, setCopied] = useState(false);
	const timer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(timer.current), []);
	// react-markdown renders the fence as `<code class="language-x">`; read the tag from it.
	const code = Array.isArray(children) ? children[0] : children;
	const lang = isValidElement<{ className?: string }>(code)
		? /language-([\w-]+)/.exec(code.props.className ?? "")?.[1]
		: undefined;
	const copy = async () => {
		const text = ref.current?.textContent ?? "";
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			window.clearTimeout(timer.current);
			timer.current = window.setTimeout(() => setCopied(false), 1500);
		} catch {
			// Clipboard blocked; nothing else to do.
		}
	};
	return (
		<div className="group/code relative">
			<pre
				{...p}
				ref={ref}
				className={cn(
					"overflow-x-auto rounded-xl bg-surface-2 p-4 font-mono text-foreground text-sm",
					className,
				)}
			>
				{children}
			</pre>
			<div className="absolute top-2 right-2 flex items-center gap-2">
				{lang ? <span className="text-subtle text-xs">{lang}</span> : null}
				<IconButton
					aria-label={copied ? "Copied" : "Copy code"}
					size="xs"
					onPress={copy}
					className="bg-surface text-muted opacity-0 shadow-xs focus-visible:opacity-100 group-hover/code:opacity-100"
				>
					{copied ? <Check /> : <Copy />}
				</IconButton>
			</div>
		</div>
	);
}

/** Document-scale renderers: larger headings with anchors, roomier code, wide tables. */
export const markdownViewerComponents: Components = {
	...markdownComponents,
	h1: heading("h1", "font-semibold text-3xl tracking-tight [&:not(:first-child)]:mt-8"),
	h2: heading(
		"h2",
		"border-border border-b pb-2 font-semibold text-2xl tracking-tight [&:not(:first-child)]:mt-8",
	),
	h3: heading("h3", "font-semibold text-xl [&:not(:first-child)]:mt-6"),
	h4: heading("h4", "font-semibold text-base [&:not(:first-child)]:mt-4"),
	h5: heading("h5", "font-semibold text-sm [&:not(:first-child)]:mt-4"),
	h6: heading("h6", "font-semibold text-muted text-sm [&:not(:first-child)]:mt-4"),
	pre: CodeBlock,
	img: ({ node: _n, className, alt, ...p }) => (
		<img {...p} alt={alt ?? ""} className={cn("my-2 max-w-full rounded-xl", className)} />
	),
	hr: ({ node: _n, className, ...p }) => (
		<hr {...p} className={cn("my-4 border-border", className)} />
	),
};

export interface MarkdownViewerProps extends Omit<ComponentProps<"article">, "children"> {
	children: string;
	/** Text size; `md` is 16 px body text, `sm` is 14 px. */
	size?: "sm" | "md";
	/** Per-tag renderers merged over `markdownViewerComponents`. */
	components?: Components;
	remarkPlugins?: Plugins;
	rehypePlugins?: Plugins;
	/** Shown while `children` is empty. */
	empty?: ReactNode;
}

/**
 * Reading view for a Markdown document. No card, border, or scroll container: the content
 * sits on the page background in normal flow, with heading anchors and copyable code.
 */
export function MarkdownViewer({
	children,
	size = "md",
	components,
	remarkPlugins: extraRemark,
	rehypePlugins: extraRehype,
	empty = null,
	className,
	...props
}: MarkdownViewerProps) {
	return (
		<article
			{...props}
			className={cn(
				"flex min-w-0 flex-col gap-4 wrap-break-word text-foreground",
				size === "sm" ? "text-sm" : "text-base",
				className,
			)}
		>
			{children.trim() ? (
				<ReactMarkdown
					remarkPlugins={extraRemark ? [...remarkPlugins, ...extraRemark] : remarkPlugins}
					rehypePlugins={extraRehype ? [...rehypePlugins, ...extraRehype] : rehypePlugins}
					components={
						components ? { ...markdownViewerComponents, ...components } : markdownViewerComponents
					}
				>
					{children}
				</ReactMarkdown>
			) : (
				empty
			)}
		</article>
	);
}
