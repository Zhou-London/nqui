/**
 * Smallest and largest values in `values`, or `undefined` when it is empty. A loop instead of
 * `Math.min(...values)`, which passes every element as an argument and overflows the call stack
 * somewhere above 100k values.
 */
export function extent(values: ArrayLike<number>): [min: number, max: number] | undefined {
	if (values.length === 0) return undefined;
	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;
	for (let i = 0; i < values.length; i++) {
		const v = values[i] as number;
		if (v < min) min = v;
		if (v > max) max = v;
	}
	return [min, max];
}
