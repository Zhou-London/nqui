import { ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
	type ComponentProps,
	createContext,
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	Button as AriaButton,
	Link as AriaLink,
	type LinkProps as AriaLinkProps,
	composeRenderProps,
	Disclosure,
	DisclosurePanel,
	type DisclosureProps,
} from "react-aria-components";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/focus-ring";
import { IconButton, type IconButtonProps } from "./button";
import { Tooltip, TooltipTrigger } from "./tooltip";

export const SIDEBAR_DEFAULT_WIDTH = 256;
export const SIDEBAR_MIN_WIDTH = 192;
export const SIDEBAR_MAX_WIDTH = 480;
/** Icon rail width when `collapsed`. */
export const SIDEBAR_RAIL_WIDTH = 64;
const KEYBOARD_STEP = 16;

interface SidebarState {
	hidden: boolean;
	setHidden: (hidden: boolean) => void;
	/** A hidden sidebar is showing its floating reopen button. */
	reopenVisible: boolean;
	setReopenVisible: (visible: boolean) => void;
	/** `SidebarTrigger`s mounted outside the sidebar, e.g. in the top bar. */
	externalTriggers: number;
	/** Counts a trigger outside the sidebar; returns the function that uncounts it. */
	registerExternalTrigger: () => () => void;
	width: number;
	setWidth: (width: number) => void;
	minWidth: number;
	maxWidth: number;
	defaultWidth: number;
}

const SidebarContext = createContext<SidebarState | null>(null);
/** True inside a `Sidebar`, so a trigger there does not count as an external one. */
const InsideSidebarContext = createContext(false);

export interface SidebarStateProps {
	/** Controlled: whether the sidebar is hidden. */
	hidden?: boolean;
	defaultHidden?: boolean;
	onHiddenChange?: (hidden: boolean) => void;
	/** Controlled width in pixels. */
	width?: number;
	defaultWidth?: number;
	onWidthChange?: (width: number) => void;
	minWidth?: number;
	maxWidth?: number;
}

function useControllable<T>(
	value: T | undefined,
	defaultValue: T,
	onChange?: (next: T) => void,
): [T, (next: T) => void] {
	const [inner, setInner] = useState(defaultValue);
	const current = value ?? inner;
	const set = useCallback(
		(next: T) => {
			setInner(next);
			onChange?.(next);
		},
		[onChange],
	);
	return [current, set];
}

function useSidebarState({
	hidden,
	defaultHidden = false,
	onHiddenChange,
	width,
	defaultWidth = SIDEBAR_DEFAULT_WIDTH,
	onWidthChange,
	minWidth = SIDEBAR_MIN_WIDTH,
	maxWidth = SIDEBAR_MAX_WIDTH,
}: SidebarStateProps): SidebarState {
	const [isHidden, setHidden] = useControllable(hidden, defaultHidden, onHiddenChange);
	const [reopenVisible, setReopenVisible] = useState(false);
	const [externalTriggers, setExternalTriggers] = useState(0);
	const registerExternalTrigger = useCallback(() => {
		setExternalTriggers((n) => n + 1);
		return () => setExternalTriggers((n) => n - 1);
	}, []);
	const [currentWidth, setRawWidth] = useControllable(width, defaultWidth, onWidthChange);
	const setWidth = useCallback(
		(next: number) => setRawWidth(Math.round(Math.min(maxWidth, Math.max(minWidth, next)))),
		[setRawWidth, minWidth, maxWidth],
	);
	return {
		hidden: isHidden,
		setHidden,
		reopenVisible,
		setReopenVisible,
		externalTriggers,
		registerExternalTrigger,
		width: currentWidth,
		setWidth,
		minWidth,
		maxWidth,
		defaultWidth,
	};
}

export interface SidebarProviderProps extends SidebarStateProps {
	children: ReactNode;
}

/**
 * Shares hide and width state between a `Sidebar` and triggers placed elsewhere, such as a
 * `SidebarTrigger` in the page header. `AppShell` mounts one automatically.
 */
export function SidebarProvider({ children, ...props }: SidebarProviderProps) {
	const state = useSidebarState(props);
	return <SidebarContext.Provider value={state}>{children}</SidebarContext.Provider>;
}

/** Hide state and width of the nearest sidebar. */
export function useSidebar(): SidebarState {
	const ctx = useContext(SidebarContext);
	if (!ctx)
		throw new Error("useSidebar must be used inside a Sidebar, SidebarProvider, or AppShell");
	return ctx;
}

export function useHasSidebarProvider(): boolean {
	return useContext(SidebarContext) !== null;
}

/**
 * Whether a hidden sidebar's floating reopen button is on screen. `PageHeader` and `Navbar`
 * pad their leading edge while it is, so it never covers a title or brand. It is never on
 * screen while a `SidebarTrigger` sits outside the sidebar, because that trigger already
 * brings the sidebar back.
 */
export function useSidebarReopenInset(): boolean {
	const ctx = useContext(SidebarContext);
	return ctx !== null && ctx.hidden && ctx.reopenVisible;
}

export interface SidebarProps extends ComponentProps<"aside">, SidebarStateProps {
	/** Icon-only rail. */
	collapsed?: boolean;
	/** Drag handle on the edge; arrow keys resize too, double-click resets. */
	resizable?: boolean;
	/**
	 * Floating button on the header row that brings the sidebar back once hidden. Only shown
	 * when no `SidebarTrigger` is mounted outside the sidebar; a trigger in the top bar stays
	 * put and does the job itself.
	 */
	showReopen?: boolean;
}

/**
 * Vertical navigation column; pair with `AppShell` or place it in a `Drawer` on mobile.
 * Put the `SidebarTrigger` in the shell's top bar so the hide button keeps its place on the
 * header row and the page content starts below it, whether the sidebar is open or not.
 */
export function Sidebar({
	collapsed,
	resizable,
	showReopen = true,
	hidden,
	defaultHidden,
	onHiddenChange,
	width,
	defaultWidth,
	onWidthChange,
	minWidth,
	maxWidth,
	className,
	children,
	style,
	...props
}: SidebarProps) {
	const inherited = useContext(SidebarContext);
	const own = useSidebarState({
		hidden,
		defaultHidden,
		onHiddenChange,
		width,
		defaultWidth,
		onWidthChange,
		minWidth,
		maxWidth,
	});
	const state = inherited ?? own;
	const [resizing, setResizing] = useState(false);
	const reopen = showReopen && state.externalTriggers === 0;
	const { setReopenVisible } = state;
	useEffect(() => {
		setReopenVisible(reopen);
	}, [setReopenVisible, reopen]);
	const pixelWidth = state.hidden ? 0 : collapsed ? SIDEBAR_RAIL_WIDTH : state.width;

	const aside = (
		<aside
			{...props}
			data-collapsed={collapsed ? "" : undefined}
			data-hidden={state.hidden ? "" : undefined}
			data-resizing={resizing ? "" : undefined}
			style={{ ...style, width: pixelWidth }}
			className={cn(
				"group/sidebar relative flex h-full shrink-0 flex-col bg-surface text-foreground",
				"transition-[width] duration-200 data-resizing:transition-none",
				state.hidden ? "border-transparent" : "border-border border-r",
				className,
			)}
		>
			<div
				inert={state.hidden || undefined}
				className="flex h-full min-w-0 flex-1 flex-col overflow-hidden"
			>
				<InsideSidebarContext.Provider value>{children}</InsideSidebarContext.Provider>
			</div>
			{resizable && !collapsed && !state.hidden ? (
				<SidebarResizer state={state} onResizingChange={setResizing} />
			) : null}
			{state.hidden && reopen ? <SidebarReopenButton /> : null}
		</aside>
	);
	return inherited ? aside : <SidebarContext.Provider value={own}>{aside}</SidebarContext.Provider>;
}

/**
 * Floating button that brings a hidden sidebar back. It sits on the header row, where the
 * hide button was, so the eye returns to the same spot.
 */
function SidebarReopenButton() {
	// It belongs to the sidebar, so it must not count as an external trigger and hide itself.
	return (
		<InsideSidebarContext.Provider value>
			<SidebarTrigger className="absolute top-3 left-4 z-10 border border-border bg-surface shadow-sm hover:bg-surface-2" />
		</InsideSidebarContext.Provider>
	);
}

interface SidebarResizerProps {
	state: SidebarState;
	onResizingChange: (resizing: boolean) => void;
}

function SidebarResizer({ state, onResizingChange }: SidebarResizerProps) {
	const drag = useRef<{ startX: number; startWidth: number } | null>(null);

	const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;
		drag.current = { startX: e.clientX, startWidth: state.width };
		e.currentTarget.setPointerCapture?.(e.pointerId);
		document.body.style.userSelect = "none";
		document.body.style.cursor = "col-resize";
		onResizingChange(true);
	};
	const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
		if (!drag.current) return;
		state.setWidth(drag.current.startWidth + e.clientX - drag.current.startX);
	};
	const end = (e: PointerEvent<HTMLDivElement>) => {
		if (!drag.current) return;
		drag.current = null;
		e.currentTarget.releasePointerCapture?.(e.pointerId);
		document.body.style.userSelect = "";
		document.body.style.cursor = "";
		onResizingChange(false);
	};
	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		const step = e.shiftKey ? KEYBOARD_STEP * 4 : KEYBOARD_STEP;
		const next =
			e.key === "ArrowLeft"
				? state.width - step
				: e.key === "ArrowRight"
					? state.width + step
					: e.key === "Home"
						? state.minWidth
						: e.key === "End"
							? state.maxWidth
							: null;
		if (next === null) return;
		e.preventDefault();
		state.setWidth(next);
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: a separator with aria-valuenow is the ARIA pattern for a window splitter
		<div
			role="separator"
			aria-orientation="vertical"
			aria-label="Resize sidebar"
			aria-valuenow={state.width}
			aria-valuemin={state.minWidth}
			aria-valuemax={state.maxWidth}
			tabIndex={0}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={end}
			onPointerCancel={end}
			onKeyDown={onKeyDown}
			onDoubleClick={() => state.setWidth(state.defaultWidth)}
			className={cn(
				focusRing(),
				"group/resizer absolute inset-y-0 -right-1 z-10 w-2 cursor-col-resize touch-none outline-hidden",
				"after:absolute after:inset-y-0 after:left-1 after:w-px after:bg-transparent after:transition-colors",
				// 44 px wide below the lg tier, still centered on the edge line.
				"max-lg:-right-[22px] max-lg:w-11 max-lg:after:left-[22px]",
				"hover:after:bg-primary focus-visible:after:bg-primary group-data-resizing/sidebar:after:bg-primary",
			)}
		/>
	);
}

export interface SidebarTriggerProps extends Omit<IconButtonProps, "aria-label" | "children"> {
	"aria-label"?: string;
}

/**
 * Hides or shows the nearest sidebar. Place it in the shell's top bar, where it stays
 * visible either way; inside the sidebar header it hides with the sidebar and a floating
 * reopen button takes over.
 */
export function SidebarTrigger({ className, "aria-label": label, ...props }: SidebarTriggerProps) {
	const { hidden, setHidden, registerExternalTrigger } = useSidebar();
	const inside = useContext(InsideSidebarContext);
	useEffect(
		() => (inside ? undefined : registerExternalTrigger()),
		[inside, registerExternalTrigger],
	);
	const text = label ?? (hidden ? "Show sidebar" : "Hide sidebar");
	return (
		<TooltipTrigger>
			<IconButton
				variant="soft"
				color="neutral"
				size="sm"
				{...props}
				aria-label={text}
				aria-expanded={!hidden}
				onPress={() => setHidden(!hidden)}
				className={cn("bg-surface-2 text-muted hover:text-foreground", className)}
			>
				{hidden ? <PanelLeftOpen /> : <PanelLeftClose />}
			</IconButton>
			<Tooltip>{text}</Tooltip>
		</TooltipTrigger>
	);
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={cn(
				"flex min-h-14 items-center gap-2 px-4 group-data-collapsed/sidebar:justify-center group-data-collapsed/sidebar:px-2",
				className,
			)}
		/>
	);
}

export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={cn("flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-2", className)}
		/>
	);
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={cn("mt-auto flex flex-col gap-1 border-border border-t px-2 py-2", className)}
		/>
	);
}

export interface SidebarGroupProps extends Omit<ComponentProps<"div">, "title"> {
	title?: ReactNode;
}

export function SidebarGroup({ title, className, children, ...props }: SidebarGroupProps) {
	return (
		<div {...props} className={cn("flex flex-col gap-1", className)}>
			{title ? (
				<div className="px-4 pb-2 font-medium text-subtle text-xs uppercase tracking-wider group-data-collapsed/sidebar:sr-only">
					{title}
				</div>
			) : null}
			{children}
		</div>
	);
}

/** Row styling shared by links and submenu triggers. */
function itemClass(isActive: boolean | undefined, cls?: string) {
	return cn(
		focusRing(),
		"relative touch-target flex h-10 w-full items-center gap-2 rounded-xl px-4 text-left font-medium text-muted text-sm transition-colors",
		"hover:bg-surface-2 hover:text-foreground pressed:bg-surface-3",
		"group-data-collapsed/sidebar:justify-center group-data-collapsed/sidebar:px-0",
		"[&>svg]:size-5 [&>svg]:shrink-0",
		isActive && "bg-accent-soft text-foreground",
		cls,
	);
}

export interface SidebarItemProps extends Omit<AriaLinkProps, "className" | "children"> {
	className?: string;
	icon?: ReactNode;
	/** Chip, count, or dot rendered at the end. */
	badge?: ReactNode;
	/** Trailing arrow for rows that open a deeper page. */
	chevron?: boolean;
	isActive?: boolean;
	children: ReactNode;
}

/** Navigation row: icon, label, optional badge. Active rows get the soft rounded fill. */
export function SidebarItem({
	icon,
	badge,
	chevron,
	isActive,
	className,
	children,
	...props
}: SidebarItemProps) {
	return (
		<AriaLink
			{...props}
			aria-current={isActive ? "page" : undefined}
			className={composeRenderProps(className, (cls) => itemClass(isActive, cls))}
		>
			{icon}
			<span className="flex-1 truncate group-data-collapsed/sidebar:sr-only">{children}</span>
			{badge ? <span className="shrink-0 group-data-collapsed/sidebar:hidden">{badge}</span> : null}
			{chevron ? (
				<ChevronRight
					aria-hidden
					className="size-4! text-subtle group-data-collapsed/sidebar:hidden"
				/>
			) : null}
		</AriaLink>
	);
}

export interface SidebarSubmenuProps
	extends Omit<DisclosureProps, "className" | "children" | "id"> {
	className?: string;
	icon?: ReactNode;
	label: ReactNode;
	/** Chip, count, or dot rendered before the chevron. */
	badge?: ReactNode;
	/** Highlight the parent row, for example when one of its children is the current page. */
	isActive?: boolean;
	/** Nested `SidebarItem`s or further `SidebarSubmenu`s. */
	children: ReactNode;
}

/**
 * Expandable parent row with an indented list of child rows joined by a guide line.
 * Nest submenus for deeper trees. The rail (`collapsed`) shows only the parent icon.
 */
export function SidebarSubmenu({
	icon,
	label,
	badge,
	isActive,
	className,
	children,
	...props
}: SidebarSubmenuProps) {
	return (
		<Disclosure
			{...props}
			className={composeRenderProps(className, (cls) => cn("group/submenu flex flex-col", cls))}
		>
			<AriaButton slot="trigger" className={itemClass(isActive)}>
				{icon}
				<span className="flex-1 truncate group-data-collapsed/sidebar:sr-only">{label}</span>
				{badge ? (
					<span className="shrink-0 group-data-collapsed/sidebar:hidden">{badge}</span>
				) : null}
				<ChevronRight
					aria-hidden
					className="size-4! text-subtle transition-transform duration-200 group-expanded/submenu:rotate-90 group-data-collapsed/sidebar:hidden"
				/>
			</AriaButton>
			<DisclosurePanel className="group-data-collapsed/sidebar:hidden">
				<div className="ml-6 flex flex-col gap-1 border-border border-l py-1 pl-2">{children}</div>
			</DisclosurePanel>
		</Disclosure>
	);
}
