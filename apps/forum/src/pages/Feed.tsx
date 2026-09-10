import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardStack,
	Chip,
	EmptyState,
	PageContent,
	PageHeader,
	Tab,
	TabList,
	Tabs,
} from "@nowquant/nqui";
import { Bookmark, Heart, MessageCircle, MessagesSquare } from "lucide-react";
import { useState } from "react";
import { type Category, categories, type Post } from "../data";

export interface FeedPageProps {
	posts: Post[];
	category: Category | null;
	onOpen: (id: string) => void;
	onUpdate: (id: string, patch: (post: Post) => Post) => void;
}

export function FeedPage({ posts, category, onOpen, onUpdate }: FeedPageProps) {
	const [sort, setSort] = useState<"latest" | "top">("latest");
	const visible = sort === "top" ? [...posts].sort((a, b) => b.likes - a.likes) : posts;
	return (
		<>
			<PageHeader
				title={category?.name ?? "All posts"}
				description={category ? `${category.count} posts` : "Everything, newest first."}
				tabs={
					<Tabs selectedKey={sort} onSelectionChange={(k) => setSort(k as "latest" | "top")}>
						<TabList aria-label="Sort">
							<Tab id="latest">Latest</Tab>
							<Tab id="top">Top</Tab>
						</TabList>
					</Tabs>
				}
			/>
			<PageContent>
				{visible.length === 0 ? (
					<EmptyState
						icon={<MessagesSquare />}
						title="No posts yet"
						description="Be the first to start a thread here."
					/>
				) : (
					<CardStack>
						{visible.map((post) => (
							<PostCard key={post.id} post={post} onOpen={onOpen} onUpdate={onUpdate} />
						))}
					</CardStack>
				)}
			</PageContent>
		</>
	);
}

export function PostCard({
	post,
	onOpen,
	onUpdate,
}: {
	post: Post;
	onOpen: (id: string) => void;
	onUpdate: FeedPageProps["onUpdate"];
}) {
	const category = categories.find((c) => c.id === post.category);
	return (
		<Card onPress={() => onOpen(post.id)}>
			<CardBody className="flex flex-col gap-4">
				<div className="flex items-center gap-2">
					<Avatar name={post.author.name} size="sm" />
					<div className="min-w-0 flex-1">
						<div className="truncate font-medium text-sm">{post.author.name}</div>
						<div className="text-subtle text-xs">
							@{post.author.handle} · {post.at}
						</div>
					</div>
					{category ? (
						<Chip size="sm" color="neutral">
							{category.name}
						</Chip>
					) : null}
				</div>
				<div className="flex flex-col gap-1">
					<h3 className="font-semibold text-base leading-snug">{post.title}</h3>
					<p className="line-clamp-2 text-muted text-sm">
						{post.body.replace(/[#*|>-]/g, "").trim()}
					</p>
				</div>
				<div className="flex items-center gap-1">
					<Button
						size="sm"
						variant="ghost"
						color={post.liked ? "primary" : "neutral"}
						startContent={<Heart className={post.liked ? "fill-current" : undefined} />}
						onPress={() =>
							onUpdate(post.id, (p) => ({
								...p,
								liked: !p.liked,
								likes: p.likes + (p.liked ? -1 : 1),
							}))
						}
					>
						{post.likes}
					</Button>
					<Button size="sm" variant="ghost" color="neutral" startContent={<MessageCircle />}>
						{post.replies.length}
					</Button>
					<Button
						size="sm"
						variant="ghost"
						color={post.saved ? "primary" : "neutral"}
						className="ml-auto"
						aria-label={post.saved ? "Unsave" : "Save"}
						startContent={<Bookmark className={post.saved ? "fill-current" : undefined} />}
						onPress={() => onUpdate(post.id, (p) => ({ ...p, saved: !p.saved }))}
					/>
				</div>
			</CardBody>
		</Card>
	);
}
