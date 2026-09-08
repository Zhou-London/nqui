import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import {
	Disclosure as AriaDisclosure,
	DisclosureGroup as AriaDisclosureGroup,
	type DisclosureGroupProps as AriaDisclosureGroupProps,
	type DisclosureProps as AriaDisclosureProps,
	Button,
	composeRenderProps,
	DisclosurePanel,
	Heading,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/focus-ring";

export interface AccordionProps extends Omit<AriaDisclosureGroupProps, "className"> {
	className?: string;
	variant?: "divided" | "bordered" | "split";
}

/** Group of collapsible sections. `allowsMultipleExpanded` opens several at once. */
export function Accordion({ variant = "divided", className, ...props }: AccordionProps) {
	return (
		<AriaDisclosureGroup
			{...props}
			data-variant={variant}
			className={composeRenderProps(className, (cls) =>
				cn(
					"group/accordion flex flex-col",
					variant === "divided" && "divide-y divide-border",
					variant === "bordered" &&
						"divide-y divide-border rounded-xl border border-border bg-surface",
					variant === "split" && "gap-2",
					cls,
				),
			)}
		/>
	);
}

export interface AccordionItemProps extends Omit<AriaDisclosureProps, "className" | "children"> {
	className?: string;
	title: ReactNode;
	subtitle?: ReactNode;
	icon?: ReactNode;
	children: ReactNode;
}

export function AccordionItem({
	title,
	subtitle,
	icon,
	className,
	children,
	...props
}: AccordionItemProps) {
	return (
		<AriaDisclosure
			{...props}
			className={composeRenderProps(className, (cls) =>
				cn(
					"group/item group-data-[variant=split]/accordion:rounded-xl group-data-[variant=split]/accordion:border group-data-[variant=split]/accordion:border-border group-data-[variant=split]/accordion:bg-surface",
					cls,
				),
			)}
		>
			<Heading className="m-0">
				<Button
					slot="trigger"
					className={cn(
						focusRing(),
						"flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left text-foreground group-data-[variant=bordered]/accordion:px-4 group-data-[variant=split]/accordion:px-4",
						"[&>svg:first-child]:size-4 [&>svg:first-child]:text-muted",
					)}
				>
					{icon}
					<span className="flex min-w-0 flex-1 flex-col">
						<span className="font-medium text-sm">{title}</span>
						{subtitle ? <span className="text-muted text-xs">{subtitle}</span> : null}
					</span>
					<ChevronDown
						aria-hidden
						className="size-4 shrink-0 text-muted transition-transform duration-200 group-expanded/item:rotate-180"
					/>
				</Button>
			</Heading>
			<DisclosurePanel className="px-1 pb-4 text-muted text-sm group-data-[variant=bordered]/accordion:px-4 group-data-[variant=split]/accordion:px-4">
				{children}
			</DisclosurePanel>
		</AriaDisclosure>
	);
}
