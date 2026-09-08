import { useEffect, useRef, useState } from "react";
import type { Trend } from "../utils/format";

/**
 * Track a changing number and report the direction of the most recent change for a short
 * window, so price cells can flash green/red. Returns "flat" once the window elapses.
 */
export function useFlash(value: number, durationMs = 600): Trend {
	const prev = useRef(value);
	const [trend, setTrend] = useState<Trend>("flat");

	useEffect(() => {
		if (value === prev.current) return;
		const next: Trend = value > prev.current ? "up" : "down";
		prev.current = value;
		setTrend(next);
		const t = window.setTimeout(() => setTrend("flat"), durationMs);
		return () => window.clearTimeout(t);
	}, [value, durationMs]);

	return trend;
}
