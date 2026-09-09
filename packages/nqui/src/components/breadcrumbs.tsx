import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import {
	Breadcrumb as AriaBreadcrumb,
	type BreadcrumbProps as AriaBreadcrumbProps,
	Breadcrumbs as AriaBreadcrumbs,
	type BreadcrumbsProps as AriaBreadcrumbsProps,
	Link,
	type LinkProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/focus-ring";

export interface BreadcrumbsProps<T extends object> extends AriaBreadcrumbsProps<T> {}

export function Breadcrumbs<T extends object>({ className, ...props }: BreadcrumbsProps<T>) {
	return (
		<AriaBreadcrumbs
			{...props}
			className={cn("flex flex-wrap items-center gap-1 text-sm", className)}
		/>
	);
}

export interface BreadcrumbProps
	extends Omit<AriaBreadcrumbProps, "children">,
		Pick<LinkProps, "href" | "target"> {
	children: ReactNode;
	icon?: ReactNode;
}

/** One crumb. The last item (no `href`) renders as the current page. */
export function Breadcrumb({ href, target, icon, children, className, ...props }: BreadcrumbProps) {
	return (
		<AriaBreadcrumb {...props} className={cn("group/crumb flex items-center gap-1", className)}>
			<Link
				href={href}
				target={target}
				className={cn(
					focusRing(),
					"flex items-center gap-1.5 rounded-sm text-muted transition-colors hover:text-foreground current:font-medium current:text-foreground disabled:cursor-default [&_svg]:size-4",
				)}
			>
				{icon}
				{children}
			</Link>
			<ChevronRight aria-hidden className="size-3.5 text-subtle group-last/crumb:hidden" />
		</AriaBreadcrumb>
	);
}
