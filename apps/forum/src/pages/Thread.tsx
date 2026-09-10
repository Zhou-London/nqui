import {
	Avatar,
	Button,
	Card,
	CardBody,
	Chip,
	Divider,
	IconButton,
	PageContent,
	toast,
} from "@nowquant/nqui";
import { Composer } from "@nowquant/nqui/editor";
import { Markdown } from "@nowquant/nqui/markdown";
import { ArrowLeft, Bookmark, Heart, Share2 } from "lucide-react";
import { categories, me, type Post } from "../data";

export function ThreadPage({
	post,
	onBack,
	onUpdate,
}: {
	post: Post;
	onBack: () => void;
	onUpdate: (id: string, patch: (post: Post) => Post) => void;
}) {
	const category = categories.find((c) => c.id === post.category);
	return (
		<div className="flex min-h-full flex-col">
			<PageContent className="flex-1">
				<div className="flex items-center gap-2">
					<IconButton aria-label="Back" onPress={onBack}>
						<ArrowLeft />
					</IconButton>
					{category ? (
						<Chip size="sm" color="neutral">
							{category.name}
						</Chip>
					) : null}
					<div className="ml-auto flex items-center gap-1">
						<IconButton
							aria-label={post.saved ? "Unsave" : "Save"}
							onPress={() => onUpdate(post.id, (p) => ({ ...p, saved: !p.saved }))}
						>
							<Bookmark className={post.saved ? "fill-current" : undefined} />
						</IconButton>
						<IconButton
							aria-label="Share"
							onPress={() => toast.success("Link copied", `threads.app/p/${post.id}`)}
						>
							<Share2 />
						</IconButton>
					</div>
				</div>
				<article className="flex flex-col gap-4">
					<h1 className="font-semibold text-2xl leading-tight">{post.title}</h1>
					<div className="flex items-center gap-2">
						<Avatar name={post.author.name} size="sm" />
						<div className="min-w-0 flex-1">
							<div className="truncate font-medium text-sm">{post.author.name}</div>
							<div className="text-subtle text-xs">
								@{post.author.handle} · {post.at}
							</div>
						</div>
						<Button
							size="sm"
							variant={post.liked ? "soft" : "outline"}
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
					</div>
					<Markdown>{post.body}</Markdown>
				</article>
				<Divider label={`${post.replies.length} replies`} />
				<div className="flex flex-col gap-4">
					{post.replies.map((reply) => (
						<Card key={reply.id} variant="flat">
							<CardBody className="flex gap-2">
								<Avatar name={reply.author.name} size="sm" />
								<div className="min-w-0 flex-1">
									<div className="flex items-baseline gap-2">
										<span className="truncate font-medium text-sm">{reply.author.name}</span>
										<span className="shrink-0 text-subtle text-xs">{reply.at}</span>
									</div>
									<p className="text-sm">{reply.body}</p>
								</div>
							</CardBody>
						</Card>
					))}
				</div>
			</PageContent>
			<div className="sticky bottom-0 border-border border-t bg-background p-4">
				<Composer
					size="sm"
					placeholder="Write a reply…"
					submitLabel="Reply"
					submitOnEnter
					formatting={false}
					attachments={false}
					onSubmit={({ value }) => {
						onUpdate(post.id, (p) => ({
							...p,
							replies: [...p.replies, { id: `r${Date.now()}`, author: me, body: value, at: "now" }],
						}));
						toast.success("Reply posted");
					}}
				/>
			</div>
		</div>
	);
}
