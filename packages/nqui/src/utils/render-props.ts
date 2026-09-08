import { composeRenderProps } from "react-aria-components";
import { twMerge } from "./cn";

type ClassNameProp<T> = string | ((values: T) => string) | undefined;

/**
 * Merge a fixed Tailwind class string with a React Aria `className` prop, which may be a
 * render-props function. The consumer's classes win on conflicts.
 */
export function composeTailwindRenderProps<T>(
	className: ClassNameProp<T>,
	tw: string,
): (values: T) => string {
	return composeRenderProps(className, (cls) => twMerge(tw, cls));
}

/**
 * Feed React Aria render props into a tailwind-variants recipe and merge the consumer's
 * `className` on top.
 */
export function composeVariants<T extends object, V extends object>(
	className: ClassNameProp<T & { defaultClassName?: string }>,
	recipe: (input: V & { className?: string }) => string,
	variants: V,
): (values: T & { defaultClassName?: string }) => string {
	return composeRenderProps(className, (cls, renderProps) =>
		recipe({ ...variants, ...renderProps, className: cls } as V & { className?: string }),
	);
}
