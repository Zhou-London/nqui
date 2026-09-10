import { useEffect, useRef, useState } from "react";
import type { Trend } from "../utils/format";

/**
 * Tracks a changing number and reports the direction of the most recent change for a short
 * window, so price cells can flash green/red. Returns "flat" once the window elapses. The
 * default window matches the 300 ms flash animation.
 */
export function useFlash(value: number, durationMs = 300): Trend {
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
