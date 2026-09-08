import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's stock class names. Custom font sizes added in the
 * NQUI theme must be registered here, otherwise `text-2xs` would be treated as a text color
 * and dropped when combined with `text-muted`.
 */
export const twMergeConfig = {
	extend: {
		classGroups: {
			"font-size": [{ text: ["2xs"] }],
		},
	},
};

export const twMerge = extendTailwindMerge(twMergeConfig);

/** Join class values (strings, arrays, objects) and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
