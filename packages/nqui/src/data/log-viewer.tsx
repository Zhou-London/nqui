import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDownToLine, Pause } from "lucide-react";
import { type ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import { Chip } from "../components/chip";
import { SearchField } from "../components/text-field";
import { ToggleButton } from "../components/toggle-button";
import { cn } from "../utils/cn";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface LogLine {
	id?: string | number;
	/** Epoch milliseconds or ISO string. */
	ts: number | string;
	level: LogLevel;
	message: string;
	/** Logger, service, or host name. */
	source?: string;
	/** Extra structured fields shown after the message. */
	fields?: Record<string, unknown>;
}

export interface LogViewerProps extends Omit<ComponentProps<"div">, "children"> {
	lines: LogLine[];
	/** Pixel height of the scroll area. */
	height?: number | string;
	/** Keep the view pinned to the newest line as lines arrive. */
	follow?: boolean;
	onFollowChange?: (follow: boolean) => void;
	showToolbar?: boolean;
	showTimestamps?: boolean;
	wrap?: boolean;
	/** Only show these levels. */
	levels?: LogLevel[];
	timeFormat?: Intl.DateTimeFormatOptions;
}

const levelStyle: Record<LogLevel, string> = {
	trace: "text-subtle",
	debug: "text-muted",
	info: "text-info-text",
	warn: "text-warning-text",
	error: "text-danger-text",
	fatal: "text-danger-text font-semibold",
};

const lineBg: Partial<Record<LogLevel, string>> = {
	warn: "bg-warning-soft/40",
	error: "bg-danger-soft/40",
	fatal: "bg-danger-soft/60",
};

const ALL_LEVELS: LogLevel[] = ["trace", "debug", "info", "warn", "error", "fatal"];

const DEFAULT_TIME_FORMAT: Intl.DateTimeFormatOptions = {
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	fractionalSecondDigits: 3,
	hour12: false,
};

/** Virtualized log stream with level filters, search, and follow-tail. */
export function LogViewer({
	lines,
	height = 360,
	follow: followProp,
	onFollowChange,
	showToolbar = true,
	showTimestamps = true,
	wrap = false,
	levels,
	timeFormat = DEFAULT_TIME_FORMAT,
	className,
	...props
}: LogViewerProps) {
	const [query, setQuery] = useState("");
	const [activeLevels, setActiveLevels] = useState<Set<LogLevel>>(
		() => new Set(levels ?? ALL_LEVELS),
	);
	// `levels` seeds the filter and re-applies whenever the prop changes.
	const levelsKey = levels?.join(",");
	// biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the joined list, not the array identity
	useEffect(() => {
		if (levels) setActiveLevels(new Set(levels));
	}, [levelsKey]);
	const [followState, setFollowState] = useState(true);
	const follow = followProp ?? followState;
	const setFollow = (v: boolean) => {
		setFollowState(v);
		onFollowChange?.(v);
	};
	const scrollRef = useRef<HTMLDivElement>(null);
	const fmt = useMemo(() => new Intl.DateTimeFormat(undefined, timeFormat), [timeFormat]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return lines.filter(
			(l) =>
				activeLevels.has(l.level) &&
				(!q || l.message.toLowerCase().includes(q) || l.source?.toLowerCase().includes(q)),
		);
	}, [lines, query, activeLevels]);

	const virtualizer = useVirtualizer({
		count: filtered.length,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => 22,
		overscan: 20,
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll when the line count changes
	useEffect(() => {
		if (follow && filtered.length > 0)
			virtualizer.scrollToIndex(filtered.length - 1, { align: "end" });
	}, [filtered.length, follow]);

	const onScroll = () => {
		const el = scrollRef.current;
		if (!el) return;
		const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
		if (atBottom !== follow) setFollow(atBottom);
	};

	const counts = useMemo(() => {
		const c: Partial<Record<LogLevel, number>> = {};
		for (const l of lines) c[l.level] = (c[l.level] ?? 0) + 1;
		return c;
	}, [lines]);

	return (
		<div
			{...props}
			className={cn(
				"flex flex-col overflow-hidden rounded-xl border border-border bg-surface",
				className,
			)}
		>
			{showToolbar ? (
				<div className="flex flex-wrap items-center gap-2 border-border border-b px-2 py-1.5">
					<SearchField
						aria-label="Search logs"
						size="sm"
						value={query}
						onChange={setQuery}
						placeholder="Filter…"
						className="w-56"
					/>
					<div className="flex items-center gap-1">
						{ALL_LEVELS.filter((l) => counts[l]).map((l) => (
							<ToggleButton
								key={l}
								size="sm"
								variant="soft"
								isSelected={activeLevels.has(l)}
								onChange={(sel) =>
									setActiveLevels((prev) => {
										const next = new Set(prev);
										if (sel) next.add(l);
										else next.delete(l);
										return next;
									})
								}
								className="h-7 gap-1 px-2 text-2xs uppercase"
							>
								<span className={levelStyle[l]}>{l}</span>
								<span className="numeric text-subtle">{counts[l]}</span>
							</ToggleButton>
						))}
					</div>
					<span className="ml-auto numeric text-muted text-xs">
						{filtered.length.toLocaleString()} lines
					</span>
					<ToggleButton
						size="sm"
						variant="soft"
						color="primary"
						isSelected={follow}
						onChange={setFollow}
						aria-label="Follow"
						className="h-7 px-2 text-xs"
					>
						{follow ? <ArrowDownToLine /> : <Pause />}
						{follow ? "Following" : "Paused"}
					</ToggleButton>
				</div>
			) : null}
			<div
				ref={scrollRef}
				role="log"
				aria-live="polite"
				aria-relevant="additions"
				onScroll={onScroll}
				className="relative overflow-auto font-mono text-xs leading-[22px]"
				style={{ height }}
			>
				<div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
					{virtualizer.getVirtualItems().map((v) => {
						const line = filtered[v.index] as LogLine;
						const key = line.id ?? v.index;
						return (
							<div
								key={key}
								ref={wrap ? virtualizer.measureElement : undefined}
								data-index={v.index}
								className={cn(
									"absolute inset-x-0 flex gap-3 px-3 hover:bg-surface-2",
									lineBg[line.level],
									wrap ? "whitespace-pre-wrap" : "whitespace-pre",
								)}
								style={{ transform: `translateY(${v.start}px)` }}
							>
								{showTimestamps ? (
									<span className="shrink-0 numeric text-subtle">
										{fmt.format(new Date(line.ts))}
									</span>
								) : null}
								<span className={cn("w-11 shrink-0 uppercase", levelStyle[line.level])}>
									{line.level}
								</span>
								{line.source ? <span className="shrink-0 text-muted">{line.source}</span> : null}
								<span className="min-w-0 flex-1 text-foreground">{line.message}</span>
								{line.fields
									? Object.entries(line.fields).map(([k, val]) => (
											<Chip key={k} size="sm" variant="outline" className="font-mono">
												{k}={String(val)}
											</Chip>
										))
									: null}
							</div>
						);
					})}
				</div>
				{filtered.length === 0 ? (
					<div className="flex h-full items-center justify-center text-muted">No log lines.</div>
				) : null}
			</div>
		</div>
	);
}
