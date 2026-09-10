import {
	CardRow,
	CardStack,
	EmptyState,
	PageContent,
	PageHeader,
	SearchField,
} from "@nowquant/nqui";
import { MessageSquareText, SearchX } from "lucide-react";
import { useState } from "react";
import type { Post } from "../data";

export function SearchPage({ posts, onOpen }: { posts: Post[]; onOpen: (id: string) => void }) {
	const [query, setQuery] = useState("");
	const q = query.trim().toLowerCase();
	const hits = q ? posts.filter((p) => `${p.title} ${p.body}`.toLowerCase().includes(q)) : [];
	return (
		<>
			<PageHeader title="Search" />
			<PageContent>
				<SearchField
					aria-label="Search posts"
					placeholder="Search titles and bodies"
					value={query}
					onChange={setQuery}
					autoFocus
				/>
				{q === "" ? (
					<EmptyState
						size="sm"
						icon={<MessageSquareText />}
						title="Type to search"
						description="Titles and bodies of every post."
					/>
				) : hits.length === 0 ? (
					<EmptyState size="sm" icon={<SearchX />} title={`Nothing for “${query}”`} />
				) : (
					<CardStack gap="sm">
						{hits.map((p) => (
							<CardRow
								key={p.id}
								title={p.title}
								description={`${p.author.name} · ${p.replies.length} replies`}
								showChevron
								onPress={() => onOpen(p.id)}
							/>
						))}
					</CardStack>
				)}
			</PageContent>
		</>
	);
}
