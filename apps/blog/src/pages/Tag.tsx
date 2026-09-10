import { Divider, EmptyState, Tab, TabList, Tabs } from "@nowquant/nqui";
import { Tags } from "lucide-react";
import { allTags, posts } from "../data";
import { PostRow } from "./Home";

export function TagPage({ tag }: { tag: string }) {
	const matches = posts.filter((p) => p.tags.includes(tag));
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-8 px-4 py-8 md:px-8">
			<div className="flex flex-col gap-4">
				<h1 className="font-semibold text-3xl tracking-tight">Topics</h1>
				<Tabs
					variant="segmented"
					selectedKey={tag}
					onSelectionChange={(key) => {
						window.location.hash = `/tag/${String(key)}`;
					}}
				>
					<TabList aria-label="Topics">
						{allTags.map((t) => (
							<Tab key={t} id={t}>
								{t}
							</Tab>
						))}
					</TabList>
				</Tabs>
			</div>
			{matches.length === 0 ? (
				<EmptyState icon={<Tags />} title={`Nothing tagged “${tag}”`} />
			) : (
				<div className="flex max-w-3xl flex-col">
					{matches.map((post, i) => (
						<div key={post.slug}>
							{i > 0 ? <Divider className="my-6" /> : null}
							<PostRow post={post} />
						</div>
					))}
				</div>
			)}
		</div>
	);
}
