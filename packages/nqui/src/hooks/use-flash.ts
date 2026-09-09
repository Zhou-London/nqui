import { useEffect, useRef, useState } from "react";
import type { Trend } from "../utils/format";

/**
 * Track a changing number and report the direction of the most recent change for a short
 * window, so price cells can flash green/red. Returns "flat" once the window elapses.
 */
export function useFlash(value: number, durationMs = 600): Trend {
	const prev = useRef(value);
	const [trend, setTrend] = useState<Trend>("flat");
	// Read through a ref so a change of `durationMs` mid-flash neither restarts nor cancels the
	// pending reset.
	const duration = useRef(durationMs);
	duration.current = durationMs;

	useEffect(() => {
		if (value === prev.current) return;
		const next: Trend = value > prev.current ? "up" : "down";
		prev.current = value;
		setTrend(next);
		const t = window.setTimeout(() => setTrend("flat"), duration.current);
		return () => window.clearTimeout(t);
	}, [value]);

	return trend;
}
