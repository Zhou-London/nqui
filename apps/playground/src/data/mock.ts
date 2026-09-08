import type { Candle } from "@nqui/charts";
import type { LogLine, OrderLevel, SchemaNode } from "@nqui/react";

/** Deterministic PRNG so the playground looks the same on every load. */
export function rng(seed = 42): () => number {
	let s = seed >>> 0;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

export function randomWalk(n: number, start = 100, vol = 0.02, seed = 1): number[] {
	const r = rng(seed);
	const out = [start];
	for (let i = 1; i < n; i++)
		out.push(Math.max(0.01, (out[i - 1] as number) * (1 + (r() - 0.48) * vol)));
	return out;
}

export function genCandles(n = 180, start = 42_000, seed = 7): Candle[] {
	const r = rng(seed);
	const out: Candle[] = [];
	let close = start;
	const day = 86_400;
	const t0 = Math.floor(Date.UTC(2026, 2, 1) / 1000) - n * day;
	for (let i = 0; i < n; i++) {
		const open = close;
		const drift = (r() - 0.47) * 0.035;
		close = open * (1 + drift);
		const high = Math.max(open, close) * (1 + r() * 0.012);
		const low = Math.min(open, close) * (1 - r() * 0.012);
		out.push({ time: t0 + i * day, open, high, low, close, volume: 800 + r() * 4200 });
	}
	return out;
}

export const symbols = [
	{ symbol: "BTC", name: "Bitcoin", price: 68_412.5, change: 0.0231, holdings: 0.2363 },
	{ symbol: "ETH", name: "Ethereum", price: 3_512.18, change: -0.0087, holdings: 4.58 },
	{ symbol: "SOL", name: "Solana", price: 213.42, change: 0.0542, holdings: 91.6 },
	{ symbol: "USDC", name: "USD Coin", price: 1.0, change: 0.0001, holdings: 2_092.32 },
	{ symbol: "BNB", name: "BNB Chain", price: 804.7, change: 0.0128, holdings: 5.19 },
	{ symbol: "LINK", name: "Chainlink", price: 18.94, change: -0.0312, holdings: 402 },
	{ symbol: "ARB", name: "Arbitrum", price: 1.21, change: 0.0871, holdings: 9_800 },
	{ symbol: "AAPL", name: "Apple", price: 231.15, change: 0.0042, holdings: 120 },
	{ symbol: "NVDA", name: "NVIDIA", price: 1_298.4, change: 0.0195, holdings: 30 },
	{ symbol: "TSLA", name: "Tesla", price: 244.9, change: -0.0219, holdings: 45 },
];

export function genOrderBook(
	mid = 68_412.5,
	levels = 14,
	seed = 3,
): { bids: OrderLevel[]; asks: OrderLevel[] } {
	const r = rng(seed);
	const bids: OrderLevel[] = [];
	const asks: OrderLevel[] = [];
	for (let i = 0; i < levels; i++) {
		bids.push([+(mid - 0.5 - i * 0.5 - r() * 0.3).toFixed(1), +(0.05 + r() * 2.4).toFixed(4)]);
		asks.push([+(mid + 0.5 + i * 0.5 + r() * 0.3).toFixed(1), +(0.05 + r() * 2.4).toFixed(4)]);
	}
	return { bids, asks };
}

export interface Position {
	id: string;
	symbol: string;
	side: "long" | "short";
	qty: number;
	entry: number;
	mark: number;
	pnl: number;
	pnlPct: number;
	trend: number[];
	updated: string;
}

export function genPositions(seed = 11): Position[] {
	const r = rng(seed);
	return symbols.slice(0, 8).map((s, i) => {
		const side = r() > 0.35 ? "long" : "short";
		const entry = s.price * (1 + (r() - 0.5) * 0.08);
		const pnlPct = ((s.price - entry) / entry) * (side === "long" ? 1 : -1);
		const qty = +(s.holdings * (0.3 + r())).toFixed(4);
		return {
			id: `pos-${i}`,
			symbol: s.symbol,
			side,
			qty,
			entry,
			mark: s.price,
			pnl: pnlPct * entry * qty,
			pnlPct,
			trend: randomWalk(24, 100, 0.03, 100 + i),
			updated: new Date(Date.UTC(2026, 8, 8, 9, 30 + i * 3)).toISOString(),
		};
	});
}

export interface Employee {
	id: string;
	name: string;
	email: string;
	role: string;
	team: string;
	type: "Employee" | "Contractor";
	status: "active" | "away" | "offline";
	salary: number;
	startDate: string;
	utilization: number;
}

const first = [
	"Kate",
	"John",
	"Amira",
	"Wei",
	"Lucas",
	"Sofia",
	"Noah",
	"Mei",
	"Ivan",
	"Zara",
	"Ethan",
	"Priya",
	"Omar",
	"Nina",
	"Leo",
	"Hana",
];
const last = [
	"Moore",
	"Smith",
	"Haddad",
	"Chen",
	"Silva",
	"Rossi",
	"Kim",
	"Tanaka",
	"Petrov",
	"Ahmed",
	"Brown",
	"Patel",
	"Farouk",
	"Novak",
	"Costa",
	"Sato",
];
const roles = [
	"Chief Executive Officer",
	"Chief Technology Officer",
	"Staff Engineer",
	"Product Designer",
	"Data Engineer",
	"Quant Researcher",
	"SRE",
	"Account Manager",
	"Analyst",
	"Recruiter",
];
const teams = ["Platform", "Data", "Design", "Trading", "Growth", "Ops"];

export function genEmployees(n = 400, seed = 5): Employee[] {
	const r = rng(seed);
	return Array.from({ length: n }, (_, i) => {
		const name = `${first[Math.floor(r() * first.length)]} ${last[Math.floor(r() * last.length)]}`;
		const statusRoll = r();
		return {
			id: `#${4586932 + i}`,
			name,
			email: `${name.toLowerCase().replace(" ", ".")}@acme.com`,
			role: roles[Math.floor(r() * roles.length)] as string,
			team: teams[Math.floor(r() * teams.length)] as string,
			type: r() > 0.2 ? "Employee" : "Contractor",
			status: statusRoll > 0.7 ? "offline" : statusRoll > 0.45 ? "away" : "active",
			salary: Math.round(60_000 + r() * 190_000),
			startDate: new Date(
				Date.UTC(2018 + Math.floor(r() * 8), Math.floor(r() * 12), 1 + Math.floor(r() * 27)),
			).toISOString(),
			utilization: +(0.4 + r() * 0.6).toFixed(2),
		};
	});
}

export function genLogs(n = 400, seed = 21): LogLine[] {
	const r = rng(seed);
	const levels: LogLine["level"][] = ["debug", "info", "info", "info", "warn", "error"];
	const sources = ["api", "worker", "ingest", "auth", "orderbook", "questdb"];
	const msgs = [
		"GET /api/v1/orders 200 in {ms}ms",
		"batch flushed rows={n}",
		"connection pool saturated, waiting",
		"retrying upstream call attempt={n}",
		"order matched id={n} px={ms}.50",
		"schema refresh complete tables={n}",
		"slow query detected duration={ms}ms",
		"token refreshed for user u_{n}",
		"disk usage 87% on /data",
		"upstream timeout after {ms}ms",
	];
	const t0 = Date.UTC(2026, 8, 8, 9, 0, 0);
	return Array.from({ length: n }, (_, i) => {
		const level = levels[Math.floor(r() * levels.length)] as LogLine["level"];
		return {
			id: i,
			ts: t0 + i * 1_250 + Math.floor(r() * 900),
			level,
			source: sources[Math.floor(r() * sources.length)],
			message: (msgs[Math.floor(r() * msgs.length)] as string)
				.replace("{ms}", String(Math.floor(r() * 900)))
				.replace("{n}", String(Math.floor(r() * 9000))),
			fields: r() > 0.8 ? { trace: Math.floor(r() * 1e6).toString(16) } : undefined,
		};
	});
}

export const schemaNodes: SchemaNode[] = [
	{
		id: "lakehouse",
		name: "lakehouse",
		kind: "database",
		children: [
			{
				id: "market",
				name: "market",
				kind: "schema",
				children: [
					{
						id: "market.trades",
						name: "trades",
						kind: "table",
						badge: "1.2B",
						children: [
							{
								id: "market.trades.ts",
								name: "ts",
								kind: "column",
								dataType: "timestamp",
								isPrimaryKey: true,
							},
							{ id: "market.trades.symbol", name: "symbol", kind: "column", dataType: "varchar" },
							{ id: "market.trades.price", name: "price", kind: "column", dataType: "double" },
							{ id: "market.trades.size", name: "size", kind: "column", dataType: "double" },
							{ id: "market.trades.side", name: "side", kind: "column", dataType: "varchar" },
						],
					},
					{
						id: "market.quotes",
						name: "quotes",
						kind: "table",
						badge: "3.8B",
						children: [
							{
								id: "market.quotes.ts",
								name: "ts",
								kind: "column",
								dataType: "timestamp",
								isPrimaryKey: true,
							},
							{ id: "market.quotes.symbol", name: "symbol", kind: "column", dataType: "varchar" },
							{ id: "market.quotes.bid", name: "bid", kind: "column", dataType: "double" },
							{ id: "market.quotes.ask", name: "ask", kind: "column", dataType: "double" },
						],
					},
					{ id: "market.ohlcv_1m", name: "ohlcv_1m", kind: "view" },
				],
			},
			{
				id: "risk",
				name: "risk",
				kind: "schema",
				children: [
					{
						id: "risk.positions",
						name: "positions",
						kind: "table",
						badge: "84k",
						children: [
							{
								id: "risk.positions.id",
								name: "id",
								kind: "column",
								dataType: "bigint",
								isPrimaryKey: true,
							},
							{ id: "risk.positions.symbol", name: "symbol", kind: "column", dataType: "varchar" },
							{ id: "risk.positions.qty", name: "qty", kind: "column", dataType: "numeric(18,8)" },
							{ id: "risk.positions.pnl", name: "pnl", kind: "column", dataType: "numeric(18,2)" },
						],
					},
					{ id: "risk.var_daily", name: "var_daily", kind: "view" },
				],
			},
		],
	},
];

export const sqlSchema = {
	market: {
		trades: ["ts", "symbol", "price", "size", "side"],
		quotes: ["ts", "symbol", "bid", "ask"],
		ohlcv_1m: ["ts", "symbol", "open", "high", "low", "close", "volume"],
	},
	risk: { positions: ["id", "symbol", "qty", "pnl"], var_daily: ["date", "desk", "var_99"] },
};

export function genTradesRows(n = 500, seed = 33): Record<string, unknown>[] {
	const r = rng(seed);
	const t0 = Date.UTC(2026, 8, 8, 13, 30);
	return Array.from({ length: n }, (_, i) => {
		const s = symbols[Math.floor(r() * symbols.length)] as (typeof symbols)[number];
		return {
			ts: new Date(t0 + i * 137).toISOString(),
			symbol: s.symbol,
			price: +(s.price * (1 + (r() - 0.5) * 0.002)).toFixed(2),
			size: +(r() * 5).toFixed(4),
			side: r() > 0.5 ? "buy" : "sell",
			venue: r() > 0.7 ? "coinbase" : r() > 0.4 ? "binance" : "kraken",
			maker: r() > 0.5,
			fee_bps: r() > 0.9 ? null : +(r() * 4).toFixed(2),
		};
	});
}

export function genSeries(
	n: number,
	seed = 1,
	base = 3000,
	vol = 0.08,
): { date: string; sessions: number; users: number }[] {
	const a = randomWalk(n, base, vol, seed);
	const b = randomWalk(n, base * 0.6, vol, seed + 1);
	const t0 = Date.UTC(2026, 7, 10);
	return Array.from({ length: n }, (_, i) => ({
		date: new Date(t0 + i * 86_400_000).toISOString().slice(0, 10),
		sessions: Math.round(a[i] as number),
		users: Math.round(b[i] as number),
	}));
}
