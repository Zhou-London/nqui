import {
	Avatar,
	Breadcrumb,
	Breadcrumbs,
	Button,
	Card,
	CardBody,
	CardRow,
	Chip,
	Divider,
	EmptyState,
	Link,
	toast,
} from "@nowquant/nqui";
import { Composer } from "@nowquant/nqui/editor";
import { Markdown, MarkdownViewer } from "@nowquant/nqui/markdown";
import { ArrowLeft, ArrowRight, FileQuestion, House, Share2 } from "lucide-react";
import { useState } from "react";
import { author, formatDate, posts } from "../data";

interface Comment {
	id: string;
	name: string;
	body: string;
	at: string;
}

const seedComments: Comment[] = [
	{
		id: "c1",
		name: "Ada Park",
		body: "The partition pruning point is the whole story. Thanks for the numbers.",
		at: "2 days ago",
	},
	{
		id: "c2",
		name: "Mateo Silva",
		body: "Did you try QuestDB with the data on NVMe rather than in memory?",
		at: "yesterday",
	},
];

export function PostPage({ slug }: { slug: string }) {
	const index = posts.findIndex((p) => p.slug === slug);
	const post = posts[index];
	const [comments, setComments] = useState(seedComments);
	if (!post) {
		return (
			<div className="mx-auto w-full max-w-page px-4 py-16 md:px-8">
				<EmptyState
					icon={<FileQuestion />}
					title="No such post"
					description={`There is no post called “${slug}”.`}
					actions={
						<Button
							color="primary"
							onPress={() => {
								window.location.hash = "/";
							}}
						>
							Back to writing
						</Button>
					}
				/>
			</div>
		);
	}
	const prev = posts[index + 1];
	const next = posts[index - 1];
	const headings = [...post.body.matchAll(/^## (.+)$/gm)].map((m) => m[1] as string);
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-8 px-4 py-8 md:px-8">
			<Breadcrumbs>
				<Breadcrumb href="/" icon={<House />}>
					Writing
				</Breadcrumb>
				<Breadcrumb href={`/tag/${post.tags[0]}`}>{post.tags[0]}</Breadcrumb>
				<Breadcrumb>{post.title}</Breadcrumb>
			</Breadcrumbs>
			<div className="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_240px]">
				<div className="flex min-w-0 flex-col gap-8">
					<header className="flex flex-col gap-4">
						<h1 className="max-w-prose font-semibold text-3xl leading-tight tracking-tight md:text-5xl">
							{post.title}
						</h1>
						<p className="max-w-prose text-muted text-xl">{post.summary}</p>
						<div className="flex flex-wrap items-center gap-4">
							<div className="flex items-center gap-2">
								<Avatar name={author.name} size="sm" />
								<span className="text-sm">{author.name}</span>
							</div>
							<span className="text-subtle text-sm">
								{formatDate(post.date)} · {post.readingMinutes} min read
							</span>
							<div className="flex flex-wrap gap-2">
								{post.tags.map((t) => (
									<Chip key={t} size="sm" color="neutral" variant="outline">
										<Link href={`/tag/${t}`} variant="muted">
											{t}
										</Link>
									</Chip>
								))}
							</div>
							<Button
								size="sm"
								variant="ghost"
								color="neutral"
								className="ml-auto"
								startContent={<Share2 />}
								onPress={() => toast.success("Link copied", `fieldnotes.dev/post/${post.slug}`)}
							>
								Share
							</Button>
						</div>
					</header>
					<MarkdownViewer className="max-w-prose">{post.body}</MarkdownViewer>
					<Divider />
					<nav aria-label="Adjacent posts" className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{prev ? (
							<CardRow
								icon={<ArrowLeft />}
								title={prev.title}
								description="Older"
								href={`/post/${prev.slug}`}
							/>
						) : (
							<span />
						)}
						{next ? (
							<CardRow
								icon={<ArrowRight />}
								title={next.title}
								description="Newer"
								href={`/post/${next.slug}`}
								showChevron
							/>
						) : null}
					</nav>
					<section className="flex flex-col gap-4">
						<h2 className="font-semibold text-xl">{comments.length} comments</h2>
						{comments.map((c) => (
							<Card key={c.id} variant="flat">
								<CardBody className="flex gap-4">
									<Avatar name={c.name} size="sm" />
									<div className="flex min-w-0 flex-1 flex-col gap-1">
										<div className="flex items-baseline gap-2">
											<span className="font-medium text-sm">{c.name}</span>
											<span className="text-subtle text-xs">{c.at}</span>
										</div>
										<Markdown className="text-sm">{c.body}</Markdown>
									</div>
								</CardBody>
							</Card>
						))}
						<Composer
							placeholder="Leave a comment…"
							submitLabel="Comment"
							attachments={false}
							renderPreview={(text) => <Markdown>{text}</Markdown>}
							onSubmit={({ value }) => {
								setComments((all) => [
									...all,
									{ id: `c${Date.now()}`, name: "You", body: value, at: "just now" },
								]);
								toast.success("Comment posted");
							}}
						/>
					</section>
				</div>
				{headings.length ? (
					<aside className="max-xl:hidden">
						<nav
							aria-label="On this page"
							className="sticky top-6 flex flex-col gap-2 border-border border-l pl-4"
						>
							<span className="font-semibold text-subtle text-xs uppercase tracking-wider">
								On this page
							</span>
							{headings.map((h) => (
								<Link key={h} href={`#${slugify(h)}`} variant="muted" className="text-sm">
									{h}
								</Link>
							))}
						</nav>
					</aside>
				) : null}
			</div>
		</div>
	);
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}
