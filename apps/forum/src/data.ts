export interface Category {
	id: string;
	name: string;
	count: number;
}

export interface Author {
	name: string;
	handle: string;
}

export interface Reply {
	id: string;
	author: Author;
	body: string;
	at: string;
}

export interface Post {
	id: string;
	category: string;
	author: Author;
	title: string;
	body: string;
	at: string;
	likes: number;
	liked: boolean;
	saved: boolean;
	replies: Reply[];
}

export const categories: Category[] = [
	{ id: "general", name: "General", count: 128 },
	{ id: "market", name: "Market talk", count: 64 },
	{ id: "strategies", name: "Strategies", count: 41 },
	{ id: "tooling", name: "Tooling", count: 23 },
	{ id: "meta", name: "Meta", count: 9 },
];

const nora: Author = { name: "Nora Kim", handle: "nora" };
const ada: Author = { name: "Ada Park", handle: "ada" };
const mateo: Author = { name: "Mateo Silva", handle: "mateo" };
const lenna: Author = { name: "Lenna Huang", handle: "lenna" };
const kai: Author = { name: "Kai Johansen", handle: "kai" };

export const me: Author = { name: "Zhou Zhou", handle: "zhou" };

export const initialPosts: Post[] = [
	{
		id: "p1",
		category: "market",
		author: nora,
		title: "Why did ES gap down 40 points at the open and recover by 10:15?",
		body: "Watched the whole thing on the DOM this morning.\n\n- Heavy selling in the first two minutes, mostly **sweep orders** across venues\n- Bids stacked at 5,400 the entire time\n- Volume dried up after 09:52 and the recovery was on thin liquidity\n\nAnyone else see resting size at 5,400 before the open? I'm trying to figure out whether that was one participant or a coincidence.",
		at: "12m",
		likes: 24,
		liked: false,
		saved: false,
		replies: [
			{
				id: "r1",
				author: mateo,
				body: "Same read here. The 5,400 bid was visible in the pre-market book from about 08:30.",
				at: "9m",
			},
			{
				id: "r2",
				author: ada,
				body: "It was two different clips of ~400 lots each. Not one participant, but they refreshed together.",
				at: "5m",
			},
		],
	},
	{
		id: "p2",
		category: "strategies",
		author: ada,
		title: "Mean reversion on the 5-minute bars: what stopped working in 2025",
		body: "A short write-up of a strategy that ran fine for three years and then decayed.\n\n## What changed\n\n1. Spreads tightened, so the edge per trade fell below fees\n2. Reversals got faster than the 5-minute sampling\n3. The overnight gap filter stopped filtering\n\n## What I tried\n\nMoving to 1-minute bars recovered some of it, at the cost of a lot more trades. Happy to share the notebook.",
		at: "1h",
		likes: 87,
		liked: true,
		saved: true,
		replies: [
			{
				id: "r3",
				author: kai,
				body: "Please share the notebook. I saw the same decay on European index futures.",
				at: "40m",
			},
		],
	},
	{
		id: "p3",
		category: "tooling",
		author: mateo,
		title: "QuestDB vs. Iceberg for tick storage: my numbers after six months",
		body: "Ingest was never the problem. Query planning on wide time ranges was.\n\n| Store | 1 day | 30 days | 1 year |\n| --- | --- | --- | --- |\n| QuestDB | 0.4 s | 6 s | 90 s |\n| Iceberg + DuckDB | 1.1 s | 4 s | 22 s |\n\nSo the lakehouse wins once the range is longer than a week, and loses below that.",
		at: "3h",
		likes: 41,
		liked: false,
		saved: false,
		replies: [],
	},
	{
		id: "p4",
		category: "general",
		author: lenna,
		title: "Introduce yourself: what are you trading and what are you building?",
		body: "New members keep arriving, so here is a thread for it. Say hello, what markets you follow, and what tooling you are working on.",
		at: "5h",
		likes: 133,
		liked: false,
		saved: false,
		replies: [
			{
				id: "r4",
				author: kai,
				body: "Kai, Oslo. Nordic power futures. Building a settlement reconciliation tool.",
				at: "4h",
			},
			{
				id: "r5",
				author: nora,
				body: "Nora, Seoul. KOSPI options. Working on a Greeks dashboard.",
				at: "4h",
			},
			{
				id: "r6",
				author: mateo,
				body: "Mateo, Lisbon. Crypto perps. Order router in C++.",
				at: "3h",
			},
		],
	},
	{
		id: "p5",
		category: "meta",
		author: kai,
		title: "Proposal: rename the Market talk category to Markets",
		body: "Shorter, and it matches the tag people already use in titles.",
		at: "1d",
		likes: 12,
		liked: false,
		saved: false,
		replies: [],
	},
	{
		id: "p6",
		category: "general",
		author: nora,
		title:
			"A very long title to see how the feed copes with wrapping on a 320 pixel wide screen without truncating anything important",
		body: "Just a layout probe. Ignore.",
		at: "2d",
		likes: 3,
		liked: false,
		saved: false,
		replies: [],
	},
];

export const notifications = [
	{ id: "n1", who: ada, text: "replied to your post", target: "Why did ES gap down…", at: "5m" },
	{
		id: "n2",
		who: kai,
		text: "liked your reply",
		target: "Mean reversion on the 5-minute bars",
		at: "1h",
	},
	{ id: "n3", who: lenna, text: "mentioned you", target: "Introduce yourself", at: "4h" },
];
