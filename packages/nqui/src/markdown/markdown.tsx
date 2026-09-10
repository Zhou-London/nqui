import type { ComponentProps } from "react";
import ReactMarkdown, { type Components, type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Code } from "../components/kbd";
import { Link } from "../components/link";
import { cn } from "../utils/cn";

/*
 * `Markdown` renders on react-markdown, which turns the text into React elements and never
 * into HTML, so raw HTML in the source is dropped and untrusted text is safe by default.
 * remark-gfm adds tables, task lists, strikethrough, footnotes, and bare URLs.
 */

type Plugins = NonNullable<Options["remarkPlugins"]>;

const remarkPlugins: Plugins = [remarkGfm];

/** Element renderers styled with NQUI tokens; spread and override to customize one tag. */
export const markdownComponents: Components = {
	h1: ({ node: _n, className, ...p }) => (
		<h1 {...p} className={cn("font-semibold text-2xl tracking-tight", className)} />
	),
	h2: ({ node: _n, className, ...p }) => (
		<h2 {...p} className={cn("font-semibold text-xl tracking-tight", className)} />
	),
	h3: ({ node: _n, className, ...p }) => (
		<h3 {...p} className={cn("font-semibold text-base", className)} />
	),
	h4: ({ node: _n, className, ...p }) => (
		<h4 {...p} className={cn("font-semibold text-base", className)} />
	),
	h5: ({ node: _n, className, ...p }) => (
		<h5 {...p} className={cn("font-semibold text-sm", className)} />
	),
	h6: ({ node: _n, className, ...p }) => (
		<h6 {...p} className={cn("font-semibold text-muted text-sm", className)} />
	),
	p: ({ node: _n, ...p }) => <p {...p} />,
	a: ({ node: _n, href, children }) => (
		<Link href={href} target="_blank" rel="noreferrer">
			{children}
		</Link>
	),
	ul: ({ node: _n, className, ...p }) => (
		<ul {...p} className={cn("flex list-disc flex-col gap-1 pl-6", className)} />
	),
	ol: ({ node: _n, className, ...p }) => (
		<ol {...p} className={cn("flex list-decimal flex-col gap-1 pl-6", className)} />
	),
	li: ({ node: _n, className, ...p }) => (
		<li {...p} className={cn("[&>ol]:mt-1 [&>ul]:mt-1", className)} />
	),
	input: ({ node: _n, className, ...p }) => (
		<input {...p} className={cn("mr-2 size-4 align-middle accent-primary", className)} />
	),
	blockquote: ({ node: _n, className, ...p }) => (
		<blockquote
			{...p}
			className={cn("flex flex-col gap-2 border-border border-l-2 pl-4 text-muted", className)}
		/>
	),
	hr: ({ node: _n, className, ...p }) => <hr {...p} className={cn("border-border", className)} />,
	pre: ({ node: _n, className, ...p }) => (
		<pre
			{...p}
			className={cn("overflow-x-auto rounded-lg bg-surface-2 p-4 font-mono text-xs", className)}
		/>
	),
	code: ({ node, className, children, ...p }) => {
		// react-markdown wraps fenced blocks in `pre`; only inline code gets the chip look.
		const inline = node?.position?.start.line === node?.position?.end.line && !className;
		return inline ? (
			<Code>{children}</Code>
		) : (
			<code {...p} className={className}>
				{children}
			</code>
		);
	},
	img: ({ node: _n, className, alt, ...p }) => (
		<img {...p} alt={alt ?? ""} className={cn("max-w-full rounded-lg", className)} />
	),
	table: ({ node: _n, className, ...p }) => (
		<div className="overflow-x-auto">
			<table {...p} className={cn("w-full border-collapse text-sm", className)} />
		</div>
	),
	th: ({ node: _n, className, ...p }) => (
		<th
			{...p}
			className={cn(
				"border-border border-b bg-surface-2 px-4 py-1 text-left font-medium text-muted text-xs",
				className,
			)}
		/>
	),
	td: ({ node: _n, className, ...p }) => (
		<td {...p} className={cn("border-border border-b px-4 py-1 align-top", className)} />
	),
};

export interface MarkdownProps extends Omit<ComponentProps<"div">, "children"> {
	children: string;
	/** Per-tag renderers merged over `markdownComponents`. */
	components?: Components;
	remarkPlugins?: Plugins;
	rehypePlugins?: NonNullable<Options["rehypePlugins"]>;
}

/** Renders a Markdown string as styled blocks with 8 px rhythm. */
export function Markdown({
	children,
	components,
	remarkPlugins: extraRemark,
	rehypePlugins,
	className,
	...props
}: MarkdownProps) {
	return (
		<div {...props} className={cn("flex flex-col gap-2 wrap-break-word", className)}>
			<ReactMarkdown
				remarkPlugins={extraRemark ? [...remarkPlugins, ...extraRemark] : remarkPlugins}
				rehypePlugins={rehypePlugins}
				components={components ? { ...markdownComponents, ...components } : markdownComponents}
			>
				{children}
			</ReactMarkdown>
		</div>
	);
}
