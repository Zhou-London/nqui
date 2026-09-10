import {
	Accordion,
	AccordionItem,
	Alert,
	Avatar,
	Button,
	Card,
	CardBody,
	Chip,
	Divider,
	Link,
	Pagination,
	TextField,
	toast,
} from "@nowquant/nqui";
import { ArrowRight, Clock } from "lucide-react";
import { useState } from "react";
import { allTags, author, formatDate, type Post, posts } from "../data";

const PER_PAGE = 4;

export function HomePage({ page, missing }: { page: number; missing?: string }) {
	const featured = posts.find((p) => p.featured);
	const rest = posts.filter((p) => p !== featured);
	const pages = Math.ceil(rest.length / PER_PAGE);
	const current = Math.min(Math.max(page, 1), pages);
	const visible = rest.slice((current - 1) * PER_PAGE, current * PER_PAGE);
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-12 px-4 py-8 md:px-8 md:py-12">
			{missing ? (
				<Alert
					color="warning"
					title="Page not found"
					description={`Nothing lives at ${missing}. Here is the front page instead.`}
				/>
			) : null}
			<section className="flex flex-col gap-6 md:flex-row md:items-center">
				<Avatar name={author.name} size="xl" className="shrink-0" />
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-3xl tracking-tight">{author.name}</h1>
					<p className="max-w-prose text-muted">{author.bio}</p>
					<div className="flex gap-4">
						{author.links.map((l) => (
							<Link key={l.label} href={l.href} target="_blank" variant="muted" className="text-sm">
								{l.label}
							</Link>
						))}
					</div>
				</div>
			</section>
			{featured ? <FeaturedCard post={featured} /> : null}
			<div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px]">
				<section className="flex flex-col gap-6">
					<h2 className="font-semibold text-xl">Latest writing</h2>
					<div className="flex flex-col">
						{visible.map((post, i) => (
							<div key={post.slug}>
								{i > 0 ? <Divider className="my-6" /> : null}
								<PostRow post={post} />
							</div>
						))}
					</div>
					{pages > 1 ? (
						<Pagination
							page={current}
							total={pages}
							onChange={(next) => {
								window.location.hash = next === 1 ? "/" : `/page/${next}`;
							}}
						/>
					) : null}
				</section>
				<aside className="flex flex-col gap-8">
					<Sidebar />
				</aside>
			</div>
		</div>
	);
}

function FeaturedCard({ post }: { post: Post }) {
	return (
		<Card variant="elevated" href={`/post/${post.slug}`} radius="2xl">
			<CardBody className="flex flex-col gap-4 p-6 md:p-8">
				<div className="flex flex-wrap items-center gap-2">
					<Chip size="sm" color="primary">
						Featured
					</Chip>
					<span className="text-subtle text-xs">
						{formatDate(post.date)} · {post.readingMinutes} min read
					</span>
				</div>
				<h2 className="max-w-prose font-semibold text-2xl leading-tight md:text-3xl">
					{post.title}
				</h2>
				<p className="max-w-prose text-muted">{post.summary}</p>
				<span className="flex items-center gap-1 font-medium text-primary-text text-sm">
					Read the post <ArrowRight className="size-4" />
				</span>
			</CardBody>
		</Card>
	);
}

export function PostRow({ post }: { post: Post }) {
	return (
		<article className="flex flex-col gap-2">
			<div className="flex flex-wrap items-center gap-2 text-subtle text-xs">
				<span>{formatDate(post.date)}</span>
				<span aria-hidden>·</span>
				<span className="flex items-center gap-1">
					<Clock className="size-3" /> {post.readingMinutes} min
				</span>
			</div>
			<h3 className="font-semibold text-xl leading-snug">
				<Link href={`/post/${post.slug}`} variant="foreground">
					{post.title}
				</Link>
			</h3>
			<p className="max-w-prose text-muted">{post.summary}</p>
			<div className="flex flex-wrap gap-2">
				{post.tags.map((t) => (
					<Chip key={t} size="sm" color="neutral" variant="outline">
						<Link href={`/tag/${t}`} variant="muted">
							{t}
						</Link>
					</Chip>
				))}
			</div>
		</article>
	);
}

export function Sidebar() {
	const [email, setEmail] = useState("");
	const years = [...new Set(posts.map((p) => p.date.slice(0, 4)))].sort().reverse();
	return (
		<>
			<section className="flex flex-col gap-4">
				<h2 className="font-semibold text-sm text-subtle uppercase tracking-wider">Topics</h2>
				<div className="flex flex-wrap gap-2">
					{allTags.map((t) => (
						<Chip key={t} size="md" color="neutral" variant="soft">
							<Link href={`/tag/${t}`} variant="foreground">
								{t}
							</Link>
							<span className="text-subtle">{posts.filter((p) => p.tags.includes(t)).length}</span>
						</Chip>
					))}
				</div>
			</section>
			<section className="flex flex-col gap-4">
				<h2 className="font-semibold text-sm text-subtle uppercase tracking-wider">Archive</h2>
				<Accordion variant="divided" defaultExpandedKeys={[years[0] ?? ""]}>
					{years.map((year) => (
						<AccordionItem
							key={year}
							id={year}
							title={year}
							subtitle={`${posts.filter((p) => p.date.startsWith(year)).length} posts`}
						>
							<ul className="flex flex-col gap-2">
								{posts
									.filter((p) => p.date.startsWith(year))
									.map((p) => (
										<li key={p.slug}>
											<Link href={`/post/${p.slug}`} variant="muted" className="text-sm">
												{p.title}
											</Link>
										</li>
									))}
							</ul>
						</AccordionItem>
					))}
				</Accordion>
			</section>
			<Card variant="flat">
				<CardBody className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<h2 className="font-semibold">Newsletter</h2>
						<p className="text-muted text-sm">One email when a post goes up. Nothing else.</p>
					</div>
					<TextField
						aria-label="Email"
						type="email"
						placeholder="you@example.com"
						value={email}
						onChange={setEmail}
					/>
					<Button
						color="primary"
						isDisabled={!email.includes("@")}
						onPress={() => {
							toast.success("Subscribed", email);
							setEmail("");
						}}
					>
						Subscribe
					</Button>
				</CardBody>
			</Card>
		</>
	);
}
