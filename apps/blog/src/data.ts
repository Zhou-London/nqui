export interface Post {
	slug: string;
	title: string;
	summary: string;
	date: string;
	readingMinutes: number;
	tags: string[];
	featured?: boolean;
	body: string;
}

export const author = {
	name: "Zhou Zhou",
	role: "Quant developer",
	bio: "I build order routers and data pipelines for a small trading desk, and write about the parts that surprised me.",
	location: "Shanghai",
	links: [
		{ label: "GitHub", href: "https://github.com" },
		{ label: "Mastodon", href: "https://mastodon.social" },
		{ label: "RSS", href: "https://fieldnotes.dev/feed.xml" },
	],
};

export const posts: Post[] = [
	{
		slug: "iceberg-vs-questdb",
		title: "Six months of tick data in Iceberg and QuestDB",
		summary:
			"Ingest was never the problem. Query planning over long ranges was, and the two stores fail in opposite directions.",
		date: "2026-08-30",
		readingMinutes: 9,
		tags: ["data", "lakehouse", "questdb"],
		featured: true,
		body: `Ingest was never the problem. Both stores take a million rows a second on a laptop. The difference shows up when you ask for a year of trades.

## The setup

- One symbol universe: 400 US equities, top of book only
- Six months of data, about 1.2 billion rows
- Queries run from a notebook on the same machine

## What the numbers looked like

| Range | QuestDB | Iceberg + DuckDB |
| --- | --- | --- |
| 1 day | 0.4 s | 1.1 s |
| 30 days | 6 s | 4 s |
| 1 year | 90 s | 22 s |

QuestDB wins below a week. The lakehouse wins above it, and the gap widens as the range grows because DuckDB prunes partitions before it reads anything.

## Where each one hurts

> QuestDB is a database that happens to store history. Iceberg is history that happens to be queryable.

The QuestDB failure mode is memory: a wide range scan on a machine with less RAM than the working set thrashes. The lakehouse failure mode is latency: even a tiny query pays for metadata reads.

\`\`\`sql
SELECT symbol, avg(spread) AS spread
FROM trades
WHERE ts BETWEEN '2026-01-01' AND '2026-06-30'
GROUP BY symbol
ORDER BY spread DESC
LIMIT 20;
\`\`\`

## What I would do again

1. Keep the last seven days in QuestDB
2. Compact everything older into Iceberg nightly
3. Point the notebook at both through one DuckDB session`,
	},
	{
		slug: "order-router-in-cpp",
		title: "Writing an order router in C++ without a framework",
		summary:
			"A plain event loop, one thread per venue, and a ring buffer in between. No Boost, no actor library, no regrets so far.",
		date: "2026-07-14",
		readingMinutes: 12,
		tags: ["cpp", "trading", "systems"],
		body: `The router is 4,000 lines. Most of that is venue adapters. The core is small enough to describe in one post.

## The shape

Each venue gets a thread that owns its socket. Orders arrive on a lock-free ring buffer; fills leave the same way. The strategy thread never touches a socket.

\`\`\`cpp
struct Order {
    uint64_t id;
    Venue venue;
    Side side;
    int64_t price;   // fixed point, 1e-4
    int32_t qty;
};
\`\`\`

## Why not a framework

Every framework I tried wanted to own the main loop. The desk already has one, and it is not negotiable.

## Latency

Median tick-to-order is 11 µs on the bench, 40 µs in production. The difference is the kernel network stack; nothing in the router.`,
	},
	{
		slug: "mean-reversion-decay",
		title: "What stopped working in my 5-minute mean reversion",
		summary:
			"Three years of steady returns, then a slow decay. Not one cause but three, and only one of them was fixable.",
		date: "2026-05-02",
		readingMinutes: 7,
		tags: ["strategies", "research"],
		body: `## What changed

1. Spreads tightened, so the edge per trade fell below fees
2. Reversals got faster than the 5-minute sampling
3. The overnight gap filter stopped filtering

## What I tried

Moving to 1-minute bars recovered some of it, at the cost of far more trades. The gap filter I simply removed.`,
	},
	{
		slug: "dark-mode-tokens",
		title: "Design tokens that survive dark mode",
		summary:
			"Every color in the UI kit is derived from four roots. That was the only way the dark palette stayed in sync.",
		date: "2026-03-19",
		readingMinutes: 5,
		tags: ["design", "css"],
		body: `## Four roots

A primary, a gray, and success, error, warning, info. Everything else is \`color-mix()\` or relative \`oklch(from …)\`.

## Why it matters

When the dark palette was hand-written it drifted within a month. Derived colors cannot drift.`,
	},
	{
		slug: "notebook-to-service",
		title: "From notebook to service in an afternoon",
		summary:
			"The research notebook became the production job with almost no rewriting. Here is the shape that made that possible.",
		date: "2026-02-08",
		readingMinutes: 6,
		tags: ["data", "python"],
		body: `## The trick

Every cell that produced a table was already a function. The notebook only called them in order. The service calls them in the same order from a scheduler.

## What broke

Timezones. Always timezones.`,
	},
	{
		slug: "reading-the-dom",
		title: "Reading the order book at the open",
		summary: "Ten minutes of watching resting size taught me more than a month of backtests.",
		date: "2025-12-11",
		readingMinutes: 4,
		tags: ["trading", "research"],
		body: `Bids stacked at 5,400 the entire session. Two clips of 400 lots each, refreshed together. Not one participant, but they moved as one.`,
	},
	{
		slug: "why-react-aria",
		title: "Why the kit is built on React Aria",
		summary:
			"Accessible state without hand-rolled hover and focus code. The styling layer stays thin because the behavior layer is thick.",
		date: "2025-10-27",
		readingMinutes: 8,
		tags: ["design", "react"],
		body: `## Behavior first

Hover, press, focus-visible, and selection states come from the hooks. The styling layer only maps them to classes.

## The cost

Bundle size. Worth it.`,
	},
];

export const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort();

export function formatDate(iso: string): string {
	return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}
