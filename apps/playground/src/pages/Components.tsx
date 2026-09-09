import {
	Accordion,
	AccordionItem,
	Alert,
	AppShell,
	Avatar,
	AvatarGroup,
	Badge,
	BottomNav,
	BottomNavItem,
	Breadcrumb,
	Breadcrumbs,
	Button,
	ButtonGroup,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	CardIcon,
	CardRow,
	CardStack,
	CardTitle,
	Cell,
	Checkbox,
	CheckboxGroup,
	Chip,
	Code,
	Column,
	ComboBox,
	ComboBoxItem,
	CommandItem,
	CommandPalette,
	CommandSection,
	DataGrid,
	type DataGridColumn,
	DataPreview,
	DatePicker,
	DateRangePicker,
	DeltaChip,
	DepthChart,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	Divider,
	Drawer,
	EmptyState,
	financeColumns,
	formatBytes,
	formatCompact,
	formatCurrency,
	formatDuration,
	formatPercent,
	Gauge,
	Heatmap,
	IconButton,
	JsonViewer,
	Kbd,
	KpiCard,
	LatencyBadge,
	Link,
	LogViewer,
	Menu,
	MenuItem,
	MenuSection,
	MenuSeparator,
	MenuTrigger,
	Meter,
	Modal,
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	NumberField,
	OrderBook,
	PageContent,
	PageHeader,
	Pagination,
	Popover,
	PopoverTrigger,
	PriceText,
	ProgressBar,
	Radio,
	RadioGroup,
	Row,
	SchemaTree,
	ScrollShadow,
	SearchField,
	Select,
	SelectItem,
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarItem,
	Skeleton,
	SkeletonText,
	Slider,
	Sparkline,
	Spinner,
	Stat,
	StatusDot,
	Switch,
	Tab,
	TabList,
	Table,
	TableBody,
	TableContainer,
	TableHeader,
	TabPanel,
	Tabs,
	Tag,
	TagGroup,
	TextArea,
	TextField,
	TickerTape,
	TimeRangeSelector,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	TooltipTrigger,
	toast,
	UptimeBar,
} from "@nowquant/nqui";
import {
	AreaChart,
	BarChart,
	CandlestickChart,
	ChartLegend,
	chartColors,
	DonutChart,
	LineChart,
} from "@nowquant/nqui/charts";
import { QueryWorkbench, SqlEditor } from "@nowquant/nqui/sql";
import {
	Bell,
	Bold,
	ChartNoAxesColumn,
	CircleChevronRight,
	Cloud,
	Database,
	Ellipsis,
	Globe,
	House,
	Inbox,
	Italic,
	KeyRound,
	Laptop,
	LogOut,
	Mail,
	Monitor,
	Moon,
	Pencil,
	Plus,
	Search,
	Settings,
	ShieldCheck,
	Star,
	Trash2,
	Underline,
	User,
	Wallet,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { SortDescriptor } from "react-aria-components";
import {
	genCandles,
	genEmployees,
	genLogs,
	genOrderBook,
	genPositions,
	genSeries,
	genTradesRows,
	type Position,
	randomWalk,
	rng,
	schemaNodes,
	sqlSchema,
	symbols,
} from "../data/mock";

const colors = ["accent", "primary", "neutral", "success", "warning", "danger", "info"] as const;
const variants = ["solid", "soft", "outline", "ghost", "link"] as const;

interface SectionDef {
	id: string;
	title: string;
	description: string;
	components: string[];
	render: () => ReactNode;
}

/* ------------------------------------------------------------------ data */

const employees = genEmployees(60);
const positions = genPositions();
const candles = genCandles(120);
const book = genOrderBook(68_412.5, 10, 8);
const logs = genLogs(120);
const tradeRows = genTradesRows(200);
const series = genSeries(14, 5, 4000, 0.12);
const barData = randomWalk(12, 40, 0.3, 9).map((v, i) => ({
	month: String(i + 1).padStart(2, "0"),
	sales: Math.round(v),
}));
const rankData = [
	{ channel: "Organic", sessions: 41_200 },
	{ channel: "Direct", sessions: 26_400 },
	{ channel: "Social", sessions: 20_100 },
	{ channel: "Referral", sessions: 14_300 },
];
const corrAssets = ["BTC", "ETH", "SOL", "BNB", "LINK"];
const corr = (() => {
	const r = rng(77);
	return corrAssets.map((_, i) =>
		corrAssets.map((__, j) => (i === j ? 1 : +(r() * 1.6 - 0.6).toFixed(2))),
	);
})();
const uptime = (() => {
	const r = rng(54);
	return Array.from({ length: 60 }, (_, i) => {
		const roll = r();
		return {
			status:
				roll > 0.97 ? ("down" as const) : roll > 0.9 ? ("degraded" as const) : ("up" as const),
			label: `Day ${i + 1}`,
		};
	});
})();

const employeeColumns: DataGridColumn<(typeof employees)[number]>[] = [
	{ accessorKey: "id", header: "ID", size: 110, pinned: "start" },
	{
		accessorKey: "name",
		header: "Member",
		size: 220,
		cell: ({ row }) => (
			<span className="flex items-center gap-2">
				<Avatar name={row.name} size="xs" />
				<span className="truncate">{row.name}</span>
			</span>
		),
	},
	{ accessorKey: "role", header: "Role", size: 190 },
	{ accessorKey: "team", header: "Team", size: 100 },
	{
		accessorKey: "status",
		header: "Status",
		size: 110,
		cell: ({ value }) => (
			<StatusDot
				status={value === "active" ? "healthy" : value === "away" ? "degraded" : "unknown"}
				label={String(value)}
			/>
		),
	},
	{
		accessorKey: "salary",
		header: "Salary",
		format: "currency",
		decimals: 0,
		size: 120,
		footer: (rows) => `Σ ${formatCompact(rows.reduce((a, r) => a + r.salary, 0))}`,
	},
	{ accessorKey: "utilization", header: "Utilization", format: "percent", size: 110 },
	{ accessorKey: "startDate", header: "Start", format: "date", size: 120 },
];

const positionColumns: DataGridColumn<Position>[] = [
	financeColumns.symbol("symbol"),
	{
		accessorKey: "side",
		header: "Side",
		size: 80,
		cell: ({ value }) => (
			<Chip size="sm" color={value === "long" ? "up" : "down"}>
				{String(value)}
			</Chip>
		),
	},
	financeColumns.price("mark", { header: "Mark", currency: "USD" }),
	financeColumns.pnl("pnl"),
	financeColumns.change("pnlPct", { header: "P&L %" }),
	financeColumns.trend("trend"),
];

const tableRows = [
	{ id: 1, name: "orders", rows: 1_240_000, size: 42.1, updated: "2026-09-08" },
	{ id: 2, name: "trades", rows: 1_200_000_000, size: 812.4, updated: "2026-09-08" },
	{ id: 3, name: "quotes", rows: 3_800_000_000, size: 2_390.0, updated: "2026-09-07" },
	{ id: 4, name: "positions", rows: 84_000, size: 3.2, updated: "2026-09-06" },
];

const scrollRows = Array.from({ length: 18 }, (_, i) => `Scrollable row ${i + 1}`);

/* --------------------------------------------------------------- helpers */

function Demo({
	label,
	children,
	className,
}: {
	label?: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={`flex flex-col gap-2 ${className ?? ""}`}>
			{label ? (
				<span className="font-medium text-2xs text-subtle uppercase tracking-wider">{label}</span>
			) : null}
			{children}
		</div>
	);
}

function Frame({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div
			className={`overflow-hidden rounded-xl border border-border bg-background ${className ?? ""}`}
		>
			{children}
		</div>
	);
}

/* -------------------------------------------------------------- sections */

function ButtonsSection() {
	return (
		<>
			<Demo label="variant × color">
				<div className="flex flex-col gap-3">
					{variants.map((variant) => (
						<div key={variant} className="flex flex-wrap items-center gap-2">
							<span className="w-16 text-muted text-xs">{variant}</span>
							{colors.map((color) => (
								<Button key={color} variant={variant} color={color}>
									{color}
								</Button>
							))}
						</div>
					))}
				</div>
			</Demo>
			<Demo label="sizes, states, icons, groups">
				<div className="flex flex-wrap items-center gap-2">
					<Button size="xs">Extra small</Button>
					<Button size="sm">Small</Button>
					<Button size="md">Medium</Button>
					<Button size="lg">Large</Button>
					<Button size="xl">Extra large</Button>
					<Button isPending>Saving</Button>
					<Button isDisabled>Disabled</Button>
					<Button radius="md" color="primary" startContent={<Plus />}>
						New order
					</Button>
					<Button fullWidth variant="soft" color="neutral" className="max-w-40">
						Full width
					</Button>
					<IconButton aria-label="Settings">
						<Settings />
					</IconButton>
					<IconButton aria-label="Inbox" variant="outline">
						<Inbox />
					</IconButton>
					<IconButton aria-label="Add" variant="solid" color="primary">
						<Plus />
					</IconButton>
					<ButtonGroup>
						<Button variant="outline" color="neutral">
							Day
						</Button>
						<Button variant="outline" color="neutral">
							Week
						</Button>
						<Button variant="outline" color="neutral">
							Month
						</Button>
					</ButtonGroup>
					<ToggleButtonGroup selectionMode="multiple" defaultSelectedKeys={["b"]}>
						<ToggleButton id="b" isIconOnly aria-label="Bold">
							<Bold />
						</ToggleButton>
						<ToggleButton id="i" isIconOnly aria-label="Italic">
							<Italic />
						</ToggleButton>
						<ToggleButton id="u" isIconOnly aria-label="Underline">
							<Underline />
						</ToggleButton>
					</ToggleButtonGroup>
					<ToggleButton variant="outline">Outline toggle</ToggleButton>
					<ToggleButton variant="soft" color="primary" defaultSelected>
						Primary toggle
					</ToggleButton>
				</div>
			</Demo>
		</>
	);
}

function DisplaySection() {
	return (
		<>
			<Demo label="chip">
				<div className="flex flex-wrap items-center gap-2">
					{colors.map((c) => (
						<Chip key={c} color={c}>
							{c}
						</Chip>
					))}
					<Chip color="up">↑ 3.3%</Chip>
					<Chip color="down">↓ 2.1%</Chip>
					<Chip variant="solid" color="primary">
						solid
					</Chip>
					<Chip variant="outline" color="success">
						outline
					</Chip>
					<Chip variant="dot" color="success">
						Healthy
					</Chip>
					<Chip variant="dot" color="warning">
						Degraded
					</Chip>
					<Chip size="sm">sm</Chip>
					<Chip size="lg" radius="md">
						lg · md radius
					</Chip>
				</div>
			</Demo>
			<Demo label="badge, avatar, avatar group, status dot">
				<div className="flex flex-wrap items-center gap-4">
					<Badge content={12}>
						<IconButton aria-label="Notifications" variant="outline">
							<Bell />
						</IconButton>
					</Badge>
					<Badge content={128} color="primary">
						<IconButton aria-label="Mail" variant="outline">
							<Mail />
						</IconButton>
					</Badge>
					<Badge>
						<IconButton aria-label="Inbox" variant="outline">
							<Inbox />
						</IconButton>
					</Badge>
					<Avatar name="Kate Moore" size="xs" />
					<Avatar name="Fred Palmer" size="sm" status="online" />
					<Avatar name="Calvin Rice" />
					<Avatar name="Sarah Johnson" size="lg" radius="lg" />
					<Avatar name="Wei Chen" size="xl" isBordered status="busy" />
					<AvatarGroup max={3} total={9}>
						<Avatar name="Kate Moore" size="sm" />
						<Avatar name="Fred Palmer" size="sm" />
						<Avatar name="Calvin Rice" size="sm" />
						<Avatar name="Sarah Johnson" size="sm" />
					</AvatarGroup>
					<StatusDot status="healthy" label="Healthy" pulse />
					<StatusDot status="degraded" label="Degraded" />
					<StatusDot status="down" label="Down" />
					<StatusDot color="primary" size="lg" />
				</div>
			</Demo>
			<Demo label="card variants">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
					{(["outline", "elevated", "flat", "glass", "ghost"] as const).map((v) => (
						<Card key={v} variant={v}>
							<CardHeader>
								<CardTitle description={`variant="${v}"`}>Card</CardTitle>
							</CardHeader>
							<CardBody className="text-muted text-sm">Header, body, footer slots.</CardBody>
							<CardFooter>
								<Button size="xs" variant="soft" color="neutral">
									Action
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</Demo>
			<Demo label="card rows · settings list, devices, pressable, links, danger, switch">
				<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
					<CardStack>
						<CardRow
							icon={<Globe />}
							title="Language"
							description="Choose your preferred language"
							endContent={
								<Button variant="outline" color="neutral" endContent={<CircleChevronRight />}>
									English
								</Button>
							}
						/>
						<CardRow
							icon={<Moon />}
							title="Dark mode"
							description="Use dark theme across the app"
							endContent={<Switch aria-label="Dark mode" />}
						/>
						<CardRow
							title={
								<>
									junior@example.com
									<Chip size="sm">Primary</Chip>
								</>
							}
							description="Notifications and account updates will be sent to this address."
							endContent={
								<MenuTrigger>
									<IconButton aria-label="Email actions" variant="soft">
										<Ellipsis />
									</IconButton>
									<Menu onAction={(k) => toast.neutral(`Action: ${String(k)}`)}>
										<MenuItem id="change" icon={<Pencil />}>
											Change email
										</MenuItem>
										<MenuItem id="primary" icon={<Star />}>
											Set as primary
										</MenuItem>
										<MenuSeparator />
										<MenuItem id="remove" icon={<Trash2 />} color="danger">
											Remove email
										</MenuItem>
									</Menu>
								</MenuTrigger>
							}
						/>
						<CardRow
							title="Delete account"
							description="Permanently remove your account and all data"
							endContent={
								<Button variant="soft" color="danger">
									Delete
								</Button>
							}
						/>
					</CardStack>
					<CardStack>
						<CardRow
							icon={<Laptop />}
							title="MacBook Pro"
							description="Last active: 2 minutes ago"
							endContent={
								<Chip variant="soft" color="success">
									Active
								</Chip>
							}
						/>
						<CardRow
							icon={<Monitor />}
							title="iMac"
							description="Last active: 3 days ago"
							endContent={
								<Button variant="outline" color="neutral">
									Revoke
								</Button>
							}
						/>
						<CardRow
							icon={<ShieldCheck />}
							title="iPhone 15 Pro"
							description="Last active: 1 hour ago"
							endContent={
								<Button variant="outline" color="neutral">
									Revoke
								</Button>
							}
						/>
						<CardRow
							icon={<User />}
							title="Account settings"
							description="Manage your account preferences"
							onPress={() => toast.neutral("Account settings")}
						/>
						<CardRow
							icon={<KeyRound />}
							title="Security"
							description="Passwords and two-factor authentication"
							href="#security"
						/>
						<CardRow
							icon={
								<CardIcon color="primary">
									<Cloud />
								</CardIcon>
							}
							title="Cloud sync"
							description="Sync data across your devices"
							size="sm"
							endContent={
								<Chip variant="soft" color="primary">
									On
								</Chip>
							}
							onPress={() => toast.neutral("Cloud sync")}
							showChevron
						/>
					</CardStack>
				</div>
			</Demo>
			<Demo label="kbd, code, link, divider, tooltip">
				<Card>
					<CardBody className="flex flex-col gap-3 py-5 text-sm">
						<p>
							Press <Kbd keys={["cmd"]}>K</Kbd> to open the palette, or{" "}
							<Kbd keys={["cmd", "enter"]} /> to run the query.
						</p>
						<p>
							Run <Code>SELECT * FROM market.trades LIMIT 10</Code> against{" "}
							<Code color="primary">lakehouse</Code> or <Code color="danger">DROP TABLE</Code>.
						</p>
						<p>
							<Link href="#">Primary link</Link> ·{" "}
							<Link href="#" variant="foreground">
								Foreground
							</Link>{" "}
							·{" "}
							<Link href="#" variant="muted">
								Muted
							</Link>{" "}
							·{" "}
							<Link href="#" variant="underline">
								Underline
							</Link>{" "}
							·{" "}
							<TooltipTrigger>
								<Link>Hover for a tooltip</Link>
								<Tooltip>Tooltips follow the accent color.</Tooltip>
							</TooltipTrigger>
						</p>
						<Divider label="or" />
						<div className="flex h-6 items-center gap-3 text-muted">
							<span>Vertical divider</span>
							<Divider orientation="vertical" />
							<span className="numeric">1,234,567.89 · 0.0042 · 98.7%</span>
						</div>
					</CardBody>
				</Card>
			</Demo>
		</>
	);
}

function FormsSection() {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			<TextField
				label="Email"
				placeholder="you@company.com"
				description="We never share it."
				startContent={<Mail />}
			/>
			<TextField
				label="API key"
				isInvalid
				errorMessage="This key has expired."
				defaultValue="sk-live-…"
			/>
			<TextField label="Filled · small" variant="filled" size="sm" placeholder="Filled variant" />
			<SearchField label="Search" placeholder="Search assets…" />
			<NumberField
				label="Quantity"
				defaultValue={2.5}
				minValue={0}
				step={0.5}
				formatOptions={{ minimumFractionDigits: 2 }}
			/>
			<NumberField
				label="Amount"
				defaultValue={1250}
				formatOptions={{ style: "currency", currency: "USD" }}
				hideStepper
				startContent={<span className="text-xs">USD</span>}
			/>
			<Select label="Exchange" defaultSelectedKey="binance" description="Where orders route.">
				<SelectItem id="binance">Binance</SelectItem>
				<SelectItem id="coinbase">Coinbase</SelectItem>
				<SelectItem id="kraken">Kraken</SelectItem>
			</Select>
			<ComboBox label="Symbol" placeholder="Type to search" startContent={<Search />}>
				<ComboBoxItem id="btc" description="Bitcoin">
					BTC
				</ComboBoxItem>
				<ComboBoxItem id="eth" description="Ethereum">
					ETH
				</ComboBoxItem>
				<ComboBoxItem id="sol" description="Solana">
					SOL
				</ComboBoxItem>
				<ComboBoxItem id="link" description="Chainlink">
					LINK
				</ComboBoxItem>
			</ComboBox>
			<DatePicker label="Settlement date" />
			<DateRangePicker label="Reporting period" className="md:col-span-2" />
			<TextArea label="Notes" placeholder="Anything else?" autoResize />
			<CheckboxGroup label="Alerts" defaultValue={["fill"]}>
				<Checkbox value="fill">Order filled</Checkbox>
				<Checkbox value="cancel" description="Includes partial cancels.">
					Order cancelled
				</Checkbox>
				<Checkbox value="margin" isDisabled>
					Margin call
				</Checkbox>
				<Checkbox value="ind" isIndeterminate color="accent">
					Indeterminate
				</Checkbox>
			</CheckboxGroup>
			<RadioGroup label="Order type" defaultValue="limit">
				<Radio value="market">Market</Radio>
				<Radio value="limit" description="Executes at your price or better.">
					Limit
				</Radio>
				<Radio value="stop" isDisabled>
					Stop
				</Radio>
			</RadioGroup>
			<div className="flex flex-col gap-4">
				<Switch defaultSelected>Post-only</Switch>
				<Switch color="success" description="Route across venues.">
					Smart routing
				</Switch>
				<Switch size="sm" labelPlacement="start">
					Label first
				</Switch>
				<Switch isDisabled>Disabled</Switch>
			</div>
			<div className="flex flex-col gap-5">
				<Slider
					label="Leverage"
					defaultValue={5}
					minValue={1}
					maxValue={20}
					renderValue={(v) => `${v[0]}×`}
				/>
				<Slider label="Price band" defaultValue={[25, 75]} color="accent" />
			</div>
			<TagGroup
				label="Watchlist"
				selectionMode="multiple"
				defaultSelectedKeys={["btc"]}
				onRemove={() => toast.neutral("Removed from watchlist")}
			>
				<Tag id="btc">BTC</Tag>
				<Tag id="eth">ETH</Tag>
				<Tag id="sol">SOL</Tag>
				<Tag id="arb">ARB</Tag>
			</TagGroup>
		</div>
	);
}

function OverlaysSection() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [paletteOpen, setPaletteOpen] = useState(false);
	return (
		<div className="flex flex-wrap items-center gap-3">
			<DialogTrigger>
				<Button>Modal</Button>
				<Modal>
					<Dialog>
						{({ close }) => (
							<>
								<DialogHeader
									title="Cancel all open orders?"
									description="12 orders across 3 venues will be cancelled."
									showClose
								/>
								<DialogBody>
									Orders that are already partially filled keep their filled quantity.
								</DialogBody>
								<DialogFooter>
									<Button variant="ghost" color="neutral" onPress={close}>
										Keep orders
									</Button>
									<Button
										color="danger"
										onPress={() => {
											toast.success("Cancelled 12 orders");
											close();
										}}
									>
										Cancel orders
									</Button>
								</DialogFooter>
							</>
						)}
					</Dialog>
				</Modal>
			</DialogTrigger>
			<Button variant="outline" color="neutral" onPress={() => setDrawerOpen(true)}>
				Drawer (right)
			</Button>
			<Drawer isOpen={drawerOpen} onOpenChange={setDrawerOpen}>
				<Dialog>
					<DialogHeader title="Order details" description="#4586932 · filled" showClose />
					<DialogBody>
						<JsonViewer
							value={{
								id: 4586932,
								symbol: "BTC-USD",
								side: "buy",
								qty: 0.25,
								fills: [{ px: 68410.5, qty: 0.1 }],
							}}
						/>
					</DialogBody>
				</Dialog>
			</Drawer>
			<Button variant="outline" color="neutral" onPress={() => setSheetOpen(true)}>
				Drawer (bottom sheet)
			</Button>
			<Drawer placement="bottom" isOpen={sheetOpen} onOpenChange={setSheetOpen}>
				<Dialog>
					<DialogHeader title="Buy Bitcoin" description="Market order" showClose />
					<DialogBody className="pb-8">
						<NumberField
							label="Amount"
							defaultValue={250}
							formatOptions={{ style: "currency", currency: "USD" }}
							hideStepper
						/>
					</DialogBody>
				</Dialog>
			</Drawer>
			<PopoverTrigger>
				<Button variant="outline" color="neutral">
					Popover
				</Button>
				<Popover showArrow className="w-72">
					<Dialog className="p-4">
						<h3 className="font-medium text-sm">Position size</h3>
						<p className="mt-1 text-muted text-sm">Risk 1% of equity per trade.</p>
						<Slider
							aria-label="Risk"
							defaultValue={1}
							minValue={0.25}
							maxValue={5}
							step={0.25}
							className="mt-3"
							renderValue={(v) => `${v[0]}%`}
						/>
					</Dialog>
				</Popover>
			</PopoverTrigger>
			<MenuTrigger>
				<Button variant="outline" color="neutral">
					Menu
				</Button>
				<Menu onAction={(k) => toast.neutral(`Action: ${String(k)}`)}>
					<MenuSection title="Issue">
						<MenuItem id="new" shortcut={["cmd", "N"]}>
							Create issue
						</MenuItem>
						<MenuItem id="kanban" description="Board view">
							Kanban board
						</MenuItem>
						<MenuItem id="list">List view</MenuItem>
					</MenuSection>
					<MenuSeparator />
					<MenuItem id="copy">Copy link</MenuItem>
					<MenuItem id="delete" color="danger">
						Delete project
					</MenuItem>
				</Menu>
			</MenuTrigger>
			<MenuTrigger>
				<Button variant="outline" color="neutral">
					Menu (multi-select)
				</Button>
				<Menu selectionMode="multiple" defaultSelectedKeys={["price", "change"]}>
					<MenuItem id="price">Price</MenuItem>
					<MenuItem id="change">Change</MenuItem>
					<MenuItem id="volume">Volume</MenuItem>
				</Menu>
			</MenuTrigger>
			<TooltipTrigger>
				<Button variant="ghost" color="neutral">
					Tooltip
				</Button>
				<Tooltip placement="bottom">Bottom placement</Tooltip>
			</TooltipTrigger>
			<Button variant="soft" color="accent" onPress={() => setPaletteOpen(true)}>
				Command palette
			</Button>
			<CommandPalette
				isOpen={paletteOpen}
				onOpenChange={setPaletteOpen}
				onAction={(k) => toast.neutral(`Command: ${String(k)}`)}
			>
				<CommandSection title="Go to">
					<CommandItem id="console">Console</CommandItem>
					<CommandItem id="warehouse">Data warehouse</CommandItem>
					<CommandItem id="trading">Trading</CommandItem>
				</CommandSection>
				<CommandSection title="Actions">
					<CommandItem id="theme" shortcut={["cmd", "shift", "L"]}>
						Toggle color scheme
					</CommandItem>
					<CommandItem id="new" shortcut={["cmd", "N"]}>
						New order
					</CommandItem>
				</CommandSection>
			</CommandPalette>
			<Button
				variant="soft"
				color="success"
				onPress={() => toast.success("Order filled", "0.25 BTC @ 68,412.50")}
			>
				Toast · success
			</Button>
			<Button
				variant="soft"
				color="info"
				onPress={() => toast.info("Backfill started", "market.trades · 2026-09-01")}
			>
				Toast · info
			</Button>
			<Button
				variant="soft"
				color="warning"
				onPress={() => toast.warning("Approaching quota", "87% used")}
			>
				Toast · warning
			</Button>
			<Button
				variant="soft"
				color="danger"
				onPress={() =>
					toast.danger("Connection lost", "Reconnecting…", {
						action: { label: "Retry now", onPress: () => toast.info("Reconnected") },
					})
				}
			>
				Toast · danger + action
			</Button>
		</div>
	);
}

function NavigationSection() {
	const [page, setPage] = useState(3);
	return (
		<div className="flex flex-col gap-6">
			<Demo label="breadcrumbs">
				<Breadcrumbs>
					<Breadcrumb href="#" icon={<Database />}>
						lakehouse
					</Breadcrumb>
					<Breadcrumb href="#">market</Breadcrumb>
					<Breadcrumb>trades</Breadcrumb>
				</Breadcrumbs>
			</Demo>
			<Demo label="tabs · underline / segmented / soft / text">
				<div className="flex flex-wrap gap-8">
					{(["underline", "segmented", "soft", "text"] as const).map((variant) => (
						<Tabs key={variant} variant={variant} defaultSelectedKey="holdings" className="gap-2">
							<TabList aria-label={variant}>
								<Tab id="overview">Overview</Tab>
								<Tab id="holdings">Holdings</Tab>
								<Tab id="defi" isDisabled>
									DeFi
								</Tab>
							</TabList>
							<TabPanel id="overview" className="text-muted text-xs">
								Overview panel
							</TabPanel>
							<TabPanel id="holdings" className="text-muted text-xs">
								Holdings panel
							</TabPanel>
							<TabPanel id="defi" className="text-muted text-xs">
								DeFi panel
							</TabPanel>
						</Tabs>
					))}
					<Tabs variant="underline" orientation="vertical" defaultSelectedKey="a" className="gap-4">
						<TabList aria-label="vertical">
							<Tab id="a">Vertical A</Tab>
							<Tab id="b">Vertical B</Tab>
						</TabList>
						<TabPanel id="a" className="text-muted text-xs">
							Vertical orientation
						</TabPanel>
						<TabPanel id="b" className="text-muted text-xs">
							Second panel
						</TabPanel>
					</Tabs>
				</div>
			</Demo>
			<Demo label="pagination">
				<div className="flex flex-wrap items-center gap-6">
					<Pagination page={page} total={24} onChange={setPage} />
					<Pagination
						page={page}
						total={24}
						onChange={setPage}
						size="md"
						siblings={2}
						showControls={false}
					/>
				</div>
			</Demo>
			<Demo label="accordion · divided / bordered / split">
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{(["divided", "bordered", "split"] as const).map((variant) => (
						<Accordion key={variant} variant={variant} defaultExpandedKeys={["a"]}>
							<AccordionItem id="a" title="What is NQUI?" subtitle={variant}>
								An original React component library built on React Aria and Tailwind CSS v4.
							</AccordionItem>
							<AccordionItem id="b" title="Does it support dark mode?">
								Yes. Every token has a dark value.
							</AccordionItem>
							<AccordionItem id="c" title="Market colors?">
								Set data-market="cn" to flip gains to red.
							</AccordionItem>
						</Accordion>
					))}
				</div>
			</Demo>
			<Demo label="time range selector">
				<TimeRangeDemo />
			</Demo>
		</div>
	);
}

function TimeRangeDemo() {
	const [range, setRange] = useState("1m");
	return (
		<div className="flex flex-wrap items-center gap-6">
			<TimeRangeSelector value={range} onChange={setRange} />
			<TimeRangeSelector
				value={range}
				onChange={setRange}
				size="md"
				options={[
					{ id: "1h", label: "1H" },
					{ id: "6h", label: "6H" },
					{ id: "1d", label: "24H" },
					{ id: "1m", label: "30D" },
				]}
			/>
			<span className="text-muted text-xs">selected: {range}</span>
		</div>
	);
}

function LayoutSection() {
	return (
		<div className="flex flex-col gap-6">
			<Demo label="navbar · glass / solid / floating">
				<Frame>
					<Navbar position="static">
						<NavbarBrand>
							<span className="size-5 rounded-md bg-accent" />
							Glass
						</NavbarBrand>
						<NavbarContent>
							<NavbarItem isActive>Dashboard</NavbarItem>
							<NavbarItem>Orders</NavbarItem>
							<NavbarItem>Settings</NavbarItem>
						</NavbarContent>
						<NavbarContent justify="end">
							<Button size="sm">Sign in</Button>
						</NavbarContent>
					</Navbar>
					<Navbar variant="solid" position="static" className="border-t">
						<NavbarBrand>Solid</NavbarBrand>
						<NavbarContent justify="center">
							<NavbarItem>Work</NavbarItem>
							<NavbarItem isActive>Writing</NavbarItem>
							<NavbarItem>About</NavbarItem>
						</NavbarContent>
						<NavbarContent justify="end">
							<Avatar name="Fred Palmer" size="xs" />
						</NavbarContent>
					</Navbar>
					<div className="bg-surface-2 pb-3">
						<Navbar variant="floating" position="static">
							<NavbarBrand>Floating</NavbarBrand>
							<NavbarContent justify="end">
								<NavbarItem>Docs</NavbarItem>
								<Button size="sm" color="primary">
									Get started
								</Button>
							</NavbarContent>
						</Navbar>
					</div>
				</Frame>
			</Demo>
			<Demo label="app shell · sidebar · page header · page content">
				<Frame>
					<AppShell
						className="h-[420px]"
						sidebar={
							<Sidebar>
								<SidebarHeader>
									<Avatar name="Kate Moore" size="sm" />
									<div className="min-w-0 leading-tight">
										<div className="truncate font-medium text-sm">Kate Moore</div>
										<div className="truncate text-muted text-xs">Admin</div>
									</div>
								</SidebarHeader>
								<SidebarContent>
									<SidebarGroup title="Workspace">
										<SidebarItem icon={<House />} isActive>
											Dashboard
										</SidebarItem>
										<SidebarItem
											icon={<Wallet />}
											badge={
												<Chip size="sm" color="success">
													New
												</Chip>
											}
										>
											Orders
										</SidebarItem>
										<SidebarItem icon={<ChartNoAxesColumn />}>Analytics</SidebarItem>
									</SidebarGroup>
									<SidebarGroup title="System">
										<SidebarItem icon={<Settings />}>Settings</SidebarItem>
									</SidebarGroup>
								</SidebarContent>
								<SidebarFooter>
									<SidebarItem icon={<LogOut />}>Log out</SidebarItem>
								</SidebarFooter>
							</Sidebar>
						}
					>
						<PageHeader
							title="Page header"
							description="Title, description, actions, and a tabs slot."
							actions={
								<>
									<Button variant="outline" color="neutral">
										Secondary
									</Button>
									<Button color="primary">Primary</Button>
								</>
							}
							tabs={
								<Tabs variant="segmented" size="sm" defaultSelectedKey="a" className="gap-0">
									<TabList aria-label="page tabs">
										<Tab id="a">Overview</Tab>
										<Tab id="b">Sales</Tab>
									</TabList>
								</Tabs>
							}
						/>
						<PageContent>
							<Card>
								<CardBody className="py-6 text-muted text-sm">
									PageContent keeps the same horizontal padding as PageHeader.
								</CardBody>
							</Card>
						</PageContent>
					</AppShell>
				</Frame>
			</Demo>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Demo label="collapsed sidebar">
					<Frame className="h-64">
						<Sidebar collapsed>
							<SidebarHeader>
								<span className="size-6 rounded-md bg-accent" />
							</SidebarHeader>
							<SidebarContent>
								<SidebarGroup>
									<SidebarItem icon={<House />} isActive>
										Dashboard
									</SidebarItem>
									<SidebarItem icon={<Wallet />}>Orders</SidebarItem>
									<SidebarItem icon={<Settings />}>Settings</SidebarItem>
								</SidebarGroup>
							</SidebarContent>
						</Sidebar>
					</Frame>
				</Demo>
				<Demo label="bottom nav (mobile) · scroll shadow">
					<Frame className="flex h-64 flex-col">
						<ScrollShadow className="flex-1 px-4 py-2 text-sm" hideScrollBar>
							{scrollRows.map((label) => (
								<div key={label} className="border-border border-b py-2 text-muted">
									{label} inside ScrollShadow
								</div>
							))}
						</ScrollShadow>
						<BottomNav>
							<BottomNavItem icon={<House />} label="Home" isActive />
							<BottomNavItem icon={<Search />} label="Search" />
							<BottomNavItem
								icon={<Wallet />}
								label="Wallet"
								badge={
									<Chip size="sm" color="primary" variant="solid">
										2
									</Chip>
								}
							/>
							<BottomNavItem icon={<Settings />} label="Settings" />
						</BottomNav>
					</Frame>
				</Demo>
			</div>
		</div>
	);
}

function FeedbackSection() {
	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Alert
					color="info"
					title="Maintenance window"
					description="Order routing pauses Sunday 02:00–02:30 UTC."
					onClose={() => undefined}
				/>
				<Alert
					color="success"
					variant="outline"
					title="Backfill complete"
					description="1.2B rows written to market.trades."
				/>
				<Alert
					color="warning"
					title="Approaching quota"
					description="87% of the storage budget is used."
					actions={
						<Button size="xs" variant="soft" color="warning">
							Increase quota
						</Button>
					}
				/>
				<Alert color="danger" title="Feed disconnected" description="Retrying in 5s…" />
				<Alert
					color="neutral"
					variant="outline"
					title="Neutral outline"
					description="Plain information."
				/>
				<Alert color="primary" title="Primary" description="A soft primary callout." hideIcon />
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div className="flex flex-col gap-4">
					<ProgressBar label="Backfill" value={64} />
					<ProgressBar label="Indexing" isIndeterminate showValue={false} color="accent" />
					<ProgressBar aria-label="Success" value={100} color="success" size="lg" />
					<Meter label="Disk" value={87} />
					<Meter label="Memory" value={42} size="sm" />
				</div>
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-4">
						<Spinner size="xs" />
						<Spinner size="sm" />
						<Spinner />
						<Spinner size="lg" color="primary" />
						<Spinner color="muted" />
					</div>
					<div className="flex items-center gap-3">
						<Skeleton className="size-10 rounded-full" />
						<SkeletonText lines={2} className="flex-1" />
					</div>
					<Skeleton className="h-16 w-full" />
					<Skeleton isLoaded>
						<span className="text-muted text-sm">isLoaded renders children.</span>
					</Skeleton>
				</div>
				<Card>
					<EmptyState
						size="sm"
						icon={<Inbox />}
						title="No alerts"
						description="New alerts will appear here."
						actions={
							<Button size="sm" variant="outline" color="neutral">
								Configure
							</Button>
						}
					/>
				</Card>
			</div>
		</div>
	);
}

function TableSection() {
	const [sort, setSort] = useState<SortDescriptor>({ column: "rows", direction: "descending" });
	const sorted = [...tableRows].sort((a, b) => {
		const k = sort.column as keyof (typeof tableRows)[number];
		const d = a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0;
		return sort.direction === "ascending" ? d : -d;
	});
	return (
		<div className="flex flex-col gap-6">
			<Demo label="table (react aria) · sorting, selection, resizing">
				<TableContainer isResizable>
					<Table
						aria-label="Tables"
						selectionMode="multiple"
						sortDescriptor={sort}
						onSortChange={setSort}
					>
						<TableHeader allowsSelection>
							<Column id="name" isRowHeader allowsSorting allowsResizing>
								Table
							</Column>
							<Column id="rows" allowsSorting align="end">
								Rows
							</Column>
							<Column id="size" allowsSorting align="end">
								Size (GB)
							</Column>
							<Column id="updated" allowsSorting>
								Updated
							</Column>
						</TableHeader>
						<TableBody items={sorted}>
							{(item) => (
								<Row allowsSelection>
									<Cell>
										<Code>{item.name}</Code>
									</Cell>
									<Cell align="end" numeric>
										{item.rows.toLocaleString()}
									</Cell>
									<Cell align="end" numeric>
										{item.size.toFixed(1)}
									</Cell>
									<Cell>{item.updated}</Cell>
								</Row>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Demo>
			<Demo label="data grid · toolbar, multi-select, pinned columns, resizing, footer, pagination">
				<DataGrid
					aria-label="Employees"
					columns={employeeColumns}
					data={employees}
					getRowId={(e) => e.id}
					selectionMode="multiple"
					enableResizing
					toolbar
					pagination={{ pageSize: 10 }}
					showFooter
					defaultSorting={[{ id: "salary", desc: true }]}
					onRowAction={(e) => toast.neutral(e.name, e.role)}
				/>
			</Demo>
			<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
				<Demo label="data grid · compact, striped, bordered, virtualized (2,000 rows)">
					<DataGrid
						aria-label="Trades"
						columns={[
							{ accessorKey: "ts", header: "Time", format: "time", size: 110 },
							{ accessorKey: "symbol", header: "Symbol", size: 90 },
							{ accessorKey: "price", header: "Price", format: "number", size: 110 },
							{ accessorKey: "size", header: "Size", format: "number", decimals: 4, size: 100 },
							{
								accessorKey: "side",
								header: "Side",
								size: 80,
								cell: ({ value }) => (
									<Chip size="sm" color={value === "buy" ? "up" : "down"}>
										{String(value)}
									</Chip>
								),
							},
							{ accessorKey: "venue", header: "Venue", size: 100 },
						]}
						data={genTradesRows(2000, 12)}
						density="compact"
						striped
						bordered
						virtualize
						height={320}
					/>
				</Demo>
				<Demo label="data grid · loading and empty states">
					<div className="flex flex-col gap-4">
						<DataGrid
							aria-label="Loading"
							columns={employeeColumns.slice(0, 4)}
							data={[]}
							isLoading
							loadingRows={4}
						/>
						<DataGrid
							aria-label="Empty"
							columns={employeeColumns.slice(0, 4)}
							data={[]}
							emptyState={
								<EmptyState
									size="sm"
									icon={<Inbox />}
									title="No employees"
									description="Invite someone to get started."
								/>
							}
						/>
					</div>
				</Demo>
			</div>
		</div>
	);
}

function DataSection() {
	return (
		<div className="flex flex-col gap-6">
			<Demo label="data preview · schema inference, sample, stats">
				<DataPreview
					title="market.trades"
					description="Inferred from 200 sample rows"
					rows={tradeRows}
					totalRows={1_200_000_000}
					sizeBytes={812.4 * 1024 ** 3}
					height={280}
				/>
			</Demo>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<Demo label="schema tree">
					<Frame className="h-80 bg-surface">
						<SchemaTree
							nodes={schemaNodes}
							defaultExpandedKeys={["lakehouse", "market", "market.trades"]}
							className="h-full"
						/>
					</Frame>
				</Demo>
				<Demo label="json viewer" className="lg:col-span-2">
					<JsonViewer
						name="order"
						className="h-80"
						value={{
							id: 4586932,
							symbol: "BTC-USD",
							side: "buy",
							qty: 0.25,
							status: null,
							post_only: true,
							fills: [
								{ px: 68410.5, qty: 0.1, venue: "binance" },
								{ px: 68412.0, qty: 0.15, venue: "coinbase" },
							],
							tags: ["algo", "twap"],
							meta: { strategy: { name: "twap", slices: 12 }, created: "2026-09-08T09:30:00Z" },
						}}
					/>
				</Demo>
			</div>
			<Demo label="log viewer · level filters, search, follow tail">
				<LogViewer lines={logs} height={280} />
			</Demo>
		</div>
	);
}

function FinanceSection() {
	const [price, setPrice] = useState(68_412.5);
	useEffect(() => {
		const id = window.setInterval(
			() => setPrice((p) => +(p * (1 + (Math.random() - 0.5) * 0.002)).toFixed(1)),
			1500,
		);
		return () => window.clearInterval(id);
	}, []);
	return (
		<div className="flex flex-col gap-6">
			<Demo label="kpi card · stat">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
					<KpiCard
						label="Revenue"
						value="$228,441"
						delta={0.033}
						trend={randomWalk(20, 100, 0.06, 1)}
					/>
					<KpiCard
						label="Expenses"
						value="$25,108"
						delta={-0.033}
						deltaProps={{ invert: true }}
						caption="vs last month"
						icon={<Wallet />}
					/>
					<KpiCard
						label="Latency p99"
						value="142 ms"
						delta={-0.12}
						deltaProps={{ invert: true }}
						trend={randomWalk(20, 100, 0.1, 3)}
						size="sm"
					/>
					<KpiCard label="Loading" value="" isLoading size="sm" />
				</div>
				<Card>
					<CardBody className="flex flex-wrap gap-8 py-5">
						<Stat label="Weekly Sales" value="$28,441" delta={0.033} />
						<Stat label="Daily Sales" value="$4,063" delta={-0.021} />
						<Stat label="Sessions" value="231,856" align="end" />
					</CardBody>
				</Card>
			</Demo>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Demo label="price text · live, flash, trend">
					<Card>
						<CardBody className="flex flex-wrap items-end gap-6 py-5">
							<PriceText
								value={price}
								currency="USD"
								size="xl"
								weight="semibold"
								flash
								trend="auto"
								reference={68_400}
							/>
							<PriceText value={price} size="lg" trend="up" />
							<PriceText
								value={price * 0.052}
								decimals={4}
								suffix=" ETH"
								size="md"
								trend="down"
								animate={false}
							/>
							<PriceText value={-1_242.77} currency="USD" size="sm" trend="auto" reference={0} />
						</CardBody>
					</Card>
				</Demo>
				<Demo label="delta chip · soft / text / solid / absolute / invert">
					<Card>
						<CardBody className="flex flex-wrap items-center gap-3 py-5">
							<DeltaChip value={0.0532} />
							<DeltaChip value={-0.021} />
							<DeltaChip value={0} />
							<DeltaChip value={0.0532} variant="text" />
							<DeltaChip value={-0.021} variant="solid" />
							<DeltaChip value={1242.77} absolute />
							<DeltaChip value={-0.12} invert />
							<DeltaChip value={0.0532} size="lg" showIcon={false} />
						</CardBody>
					</Card>
				</Demo>
			</div>
			<Demo label="sparkline · auto / primary / no area / baseline / last point">
				<Card>
					<CardBody className="grid grid-cols-2 gap-6 py-5 md:grid-cols-5">
						<Sparkline data={randomWalk(30, 100, 0.06, 11)} height={40} />
						<Sparkline data={randomWalk(30, 100, 0.06, 12)} height={40} color="primary" />
						<Sparkline
							data={randomWalk(30, 100, 0.06, 13)}
							height={40}
							area={false}
							smooth={false}
						/>
						<Sparkline
							data={randomWalk(30, 100, 0.06, 14)}
							height={40}
							baseline={100}
							color="muted"
						/>
						<Sparkline data={randomWalk(30, 100, 0.06, 15)} height={40} showLast strokeWidth={2} />
					</CardBody>
				</Card>
			</Demo>
			<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
				<Demo label="order book · stacked">
					<OrderBook
						bids={book.bids}
						asks={book.asks}
						depth={7}
						priceDecimals={1}
						lastPrice={price}
						lastTrend="up"
					/>
				</Demo>
				<Demo label="order book · split, compact sizes" className="xl:col-span-2">
					<OrderBook
						bids={book.bids}
						asks={book.asks}
						depth={7}
						priceDecimals={1}
						layout="split"
						compactSizes
						showTotal={false}
					/>
				</Demo>
			</div>
			<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
				<Demo label="depth chart">
					<Card>
						<CardBody className="py-4">
							<DepthChart bids={book.bids} asks={book.asks} height={140} priceDecimals={1} />
						</CardBody>
					</Card>
				</Demo>
				<Demo label="positions · finance column presets">
					<DataGrid
						aria-label="Positions"
						columns={positionColumns}
						data={positions}
						getRowId={(p) => p.id}
						density="compact"
					/>
				</Demo>
			</div>
			<Demo label="ticker tape">
				<TickerTape
					items={symbols.map((s) => ({ symbol: s.symbol, price: s.price, change: s.change }))}
					duration={35}
					className="rounded-xl border-x"
				/>
			</Demo>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
				<Demo label="gauge">
					<Card>
						<CardBody className="flex justify-center py-5">
							<Gauge value={64} label="CPU" />
						</CardBody>
					</Card>
				</Demo>
				<Demo label="gauge · thresholds">
					<Card>
						<CardBody className="flex justify-center py-5">
							<Gauge value={93} label="Disk" size={140} />
						</CardBody>
					</Card>
				</Demo>
				<Demo label="latency badge">
					<Card>
						<CardBody className="flex flex-wrap items-center gap-2 py-5">
							<LatencyBadge value={42} />
							<LatencyBadge value={310} />
							<LatencyBadge value={1200} prefix="p99 " />
							<LatencyBadge value={0.6} />
						</CardBody>
					</Card>
				</Demo>
				<Demo label="uptime bar">
					<Card>
						<CardBody className="py-5">
							<UptimeBar
								periods={uptime}
								startLabel="60 days ago"
								endLabel="Today"
								availability={0.9987}
							/>
						</CardBody>
					</Card>
				</Demo>
			</div>
			<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
				<Demo label="heatmap · diverging">
					<Card>
						<CardBody className="overflow-x-auto py-5">
							<Heatmap rows={corrAssets} cols={corrAssets} values={corr} cellSize={44} />
						</CardBody>
					</Card>
				</Demo>
				<Demo label="heatmap · sequential, no labels">
					<Card>
						<CardBody className="overflow-x-auto py-5">
							<Heatmap
								rows={["Mon", "Tue", "Wed", "Thu", "Fri"]}
								cols={Array.from({ length: 12 }, (_, i) => String(i * 2).padStart(2, "0"))}
								values={Array.from({ length: 5 }, (_, r) =>
									Array.from(
										{ length: 12 },
										(_, c) => +((c > 3 && c < 9 ? 0.6 : 0.15) * ((r + 1) * 0.2) * 3).toFixed(2),
									),
								)}
								scale="sequential"
								cellSize={26}
								showValues={false}
							/>
						</CardBody>
					</Card>
				</Demo>
			</div>
		</div>
	);
}

function ChartsSection() {
	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle description="LineChart · two series, reference line">Line</CardTitle>
						<ChartLegend
							items={[
								{ name: "Sessions", color: chartColors[0] },
								{ name: "Users", color: chartColors[1] },
							]}
						/>
					</CardHeader>
					<CardBody className="pb-4">
						<LineChart
							data={series}
							xKey="date"
							series={[
								{ key: "sessions", name: "Sessions" },
								{ key: "users", name: "Users", dashed: true },
							]}
							height={220}
							referenceY={4000}
							referenceLabel="target"
							xFormatter={(v) => String(v).slice(5)}
							yFormatter={(v) => `${Math.round(v / 1000)}k`}
						/>
					</CardBody>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle description="AreaChart · gradient fills, stacked">Area</CardTitle>
					</CardHeader>
					<CardBody className="pb-4">
						<AreaChart
							data={series}
							xKey="date"
							series={[
								{ key: "sessions", name: "Sessions", stackId: "a" },
								{ key: "users", name: "Users", stackId: "a" },
							]}
							height={220}
							xFormatter={(v) => String(v).slice(5)}
							yFormatter={(v) => `${Math.round(v / 1000)}k`}
						/>
					</CardBody>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle description="BarChart · vertical, gradient bars">Bar</CardTitle>
					</CardHeader>
					<CardBody className="pb-4">
						<BarChart
							data={barData}
							xKey="month"
							series={[{ key: "sales", name: "Sales" }]}
							height={220}
						/>
					</CardBody>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle description='BarChart · layout="horizontal"'>Ranked bars</CardTitle>
					</CardHeader>
					<CardBody className="pb-4">
						<BarChart
							data={rankData}
							xKey="channel"
							series={[{ key: "sessions", name: "Sessions" }]}
							layout="horizontal"
							height={220}
							yFormatter={(v) => `${Math.round(v / 1000)}k`}
						/>
					</CardBody>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle description="DonutChart · center total, legend">Donut</CardTitle>
					</CardHeader>
					<CardBody className="pb-5">
						<DonutChart
							data={[
								{ name: "Housing", value: 1840 },
								{ name: "Food & Drinks", value: 612 },
								{ name: "Shopping", value: 380 },
								{ name: "Travel", value: 240 },
								{ name: "Entertainment", value: 525 },
							]}
							valueFormatter={(v) => formatCurrency(v)}
						/>
					</CardBody>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle description="CandlestickChart · volume, moving averages">
							Candlestick
						</CardTitle>
					</CardHeader>
					<CardBody className="px-2 pb-2">
						<CandlestickChart data={candles} height={260} showVolume movingAverages={[7, 21]} />
					</CardBody>
				</Card>
			</div>
		</div>
	);
}

function SqlSection() {
	return (
		<div className="flex flex-col gap-6">
			<Demo label="sql editor · toolbar, schema completion, ⌘↵ to run">
				<SqlEditor
					toolbar
					dialect="postgresql"
					schema={sqlSchema}
					defaultSchema="market"
					defaultValue={
						"SELECT symbol, avg(price) AS vwap, sum(size) AS volume\nFROM market.trades\nWHERE ts > now() - interval '1 hour'\nGROUP BY symbol\nORDER BY volume DESC;"
					}
					onRun={(q, sel) =>
						toast.info(sel ? "Ran selection" : "Ran query", `${q.length} characters`)
					}
					minHeight={140}
				/>
			</Demo>
			<Demo label="sql editor · read only, no gutter, wrapped">
				<SqlEditor
					readOnly
					lineNumbers={false}
					lineWrapping
					dialect="mysql"
					defaultValue="-- Read-only snippet with a very long line that wraps instead of scrolling horizontally, useful for showing generated SQL in a review panel."
					minHeight={60}
				/>
			</Demo>
			<Demo label="query workbench · editor + results + status">
				<QueryWorkbench
					dialect="postgresql"
					schema={sqlSchema}
					defaultValue={"SELECT ts, symbol, price, size, side\nFROM market.trades\nLIMIT 50;"}
					resultsHeight={220}
					onRun={async (q) => {
						await new Promise((r) => setTimeout(r, 400));
						if (/error/i.test(q)) throw new Error('syntax error at or near "error"');
						const limit = Number(/limit\s+(\d+)/i.exec(q)?.[1] ?? 50);
						return {
							columns: [
								{ name: "ts", type: "timestamp" },
								{ name: "symbol", type: "varchar" },
								{ name: "price", type: "double" },
								{ name: "size", type: "double" },
								{ name: "side", type: "varchar" },
							],
							rows: tradeRows.slice(0, limit),
							elapsedMs: 412,
						};
					}}
				/>
			</Demo>
		</div>
	);
}

function UtilitiesSection() {
	const rows = [
		["formatCurrency(24801.32)", formatCurrency(24801.32)],
		["formatCompact(1200000000)", formatCompact(1_200_000_000)],
		["formatPercent(0.0532)", formatPercent(0.0532)],
		["formatBytes(812.4 GB)", formatBytes(812.4 * 1024 ** 3)],
		["formatDuration(192000)", formatDuration(192_000)],
	];
	return (
		<Card>
			<CardBody className="grid grid-cols-1 gap-x-8 gap-y-2 py-5 text-sm md:grid-cols-2">
				{rows.map(([call, out]) => (
					<div
						key={call}
						className="flex items-center justify-between gap-4 border-border border-b py-1.5 last:border-b-0"
					>
						<Code>{call}</Code>
						<span className="numeric font-medium">{out}</span>
					</div>
				))}
			</CardBody>
		</Card>
	);
}

/* --------------------------------------------------------------- catalog */

const sections: SectionDef[] = [
	{
		id: "buttons",
		title: "Buttons",
		description: "Pill buttons in five variants and seven colors.",
		components: ["Button", "IconButton", "ButtonGroup", "ToggleButton", "ToggleButtonGroup"],
		render: () => <ButtonsSection />,
	},
	{
		id: "display",
		title: "Display",
		description: "Small labels, identity, and surfaces.",
		components: [
			"Chip",
			"Badge",
			"Avatar",
			"AvatarGroup",
			"StatusDot",
			"Card",
			"CardRow",
			"CardIcon",
			"CardStack",
			"Kbd",
			"Code",
			"Link",
			"Divider",
			"Tooltip",
		],
		render: () => <DisplaySection />,
	},
	{
		id: "forms",
		title: "Forms",
		description: "Every input shares one box style with label, description, and error slots.",
		components: [
			"TextField",
			"TextArea",
			"SearchField",
			"NumberField",
			"Select",
			"ComboBox",
			"DatePicker",
			"DateRangePicker",
			"Checkbox",
			"CheckboxGroup",
			"Radio",
			"RadioGroup",
			"Switch",
			"Slider",
			"TagGroup",
			"Form",
		],
		render: () => <FormsSection />,
	},
	{
		id: "overlays",
		title: "Overlays",
		description: "Modal, drawers, popovers, menus, the command palette, and toasts.",
		components: [
			"Modal",
			"Dialog",
			"Drawer",
			"Popover",
			"Menu",
			"CommandPalette",
			"Tooltip",
			"toast",
		],
		render: () => <OverlaysSection />,
	},
	{
		id: "navigation",
		title: "Navigation",
		description: "Ways to move between views.",
		components: ["Breadcrumbs", "Tabs", "Pagination", "Accordion", "TimeRangeSelector"],
		render: () => <NavigationSection />,
	},
	{
		id: "layout",
		title: "Layout",
		description: "Page-level shells for consoles and sites.",
		components: [
			"Navbar",
			"AppShell",
			"Sidebar",
			"PageHeader",
			"PageContent",
			"BottomNav",
			"ScrollShadow",
		],
		render: () => <LayoutSection />,
	},
	{
		id: "feedback",
		title: "Feedback",
		description: "Status messages and loading states.",
		components: ["Alert", "ProgressBar", "Meter", "Spinner", "Skeleton", "EmptyState"],
		render: () => <FeedbackSection />,
	},
	{
		id: "tables",
		title: "Tables",
		description:
			"The React Aria table for simple lists and the virtualized grid for everything else.",
		components: ["Table", "DataGrid"],
		render: () => <TableSection />,
	},
	{
		id: "data",
		title: "Data",
		description: "Explore datasets, schemas, payloads, and logs.",
		components: ["DataPreview", "SchemaTree", "JsonViewer", "LogViewer"],
		render: () => <DataSection />,
	},
	{
		id: "finance",
		title: "Finance",
		description: "Prices, deltas, ladders, and risk visuals with market-aware colors.",
		components: [
			"KpiCard",
			"Stat",
			"PriceText",
			"DeltaChip",
			"Sparkline",
			"OrderBook",
			"DepthChart",
			"TickerTape",
			"Gauge",
			"LatencyBadge",
			"UptimeBar",
			"Heatmap",
			"financeColumns",
		],
		render: () => <FinanceSection />,
	},
	{
		id: "charts",
		title: "Charts",
		description: "@nowquant/nqui/charts on the token palette.",
		components: [
			"LineChart",
			"AreaChart",
			"BarChart",
			"DonutChart",
			"CandlestickChart",
			"ChartLegend",
			"ChartTooltip",
		],
		render: () => <ChartsSection />,
	},
	{
		id: "sql",
		title: "SQL",
		description: "@nowquant/nqui/sql editing and query workbench.",
		components: ["SqlEditor", "QueryWorkbench"],
		render: () => <SqlSection />,
	},
	{
		id: "utilities",
		title: "Utilities",
		description: "Formatting helpers exported from @nowquant/nqui.",
		components: [
			"formatCurrency",
			"formatCompact",
			"formatPercent",
			"formatBytes",
			"formatDuration",
			"useTheme",
			"useFlash",
		],
		render: () => <UtilitiesSection />,
	},
];

const total = sections.reduce((a, s) => a + s.components.length, 0);

export function ComponentsPage() {
	const [active, setActive] = useState(sections[0]?.id ?? "buttons");
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = scrollRef.current;
		if (!root) return;
		// The active group is the last one whose top has scrolled past the header line.
		const update = () => {
			const line = root.getBoundingClientRect().top + 96;
			let current = sections[0]?.id ?? "buttons";
			for (const el of root.querySelectorAll<HTMLElement>("[data-section]")) {
				if (el.getBoundingClientRect().top <= line) current = el.dataset.section ?? current;
			}
			setActive(current);
		};
		update();
		root.addEventListener("scroll", update, { passive: true });
		return () => root.removeEventListener("scroll", update);
	}, []);

	const jump = (id: string) => {
		scrollRef.current
			?.querySelector(`[data-section="${id}"]`)
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		// `overflow-hidden` keeps the page from becoming a second scroll container, so
		// `scrollIntoView` only moves the gallery pane and the sidebar stays put.
		<div className="flex h-full overflow-hidden">
			<aside className="hidden w-60 shrink-0 flex-col border-border border-r bg-surface lg:flex">
				<div className="px-5 pt-5 pb-3">
					<div className="font-semibold text-sm">All components</div>
					<div className="text-muted text-xs">
						{total} exports in {sections.length} groups
					</div>
				</div>
				<nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4">
					{sections.map((s) => (
						<SidebarItem
							key={s.id}
							isActive={active === s.id}
							onPress={() => jump(s.id)}
							badge={<span className="numeric text-2xs text-subtle">{s.components.length}</span>}
						>
							{s.title}
						</SidebarItem>
					))}
				</nav>
			</aside>
			{/* `relative` contains absolutely positioned descendants such as `sr-only` labels in the
			    collapsed-sidebar demo; without it they escape to the document and make it scroll. */}
			<div ref={scrollRef} className="relative min-w-0 flex-1 overflow-y-auto">
				<div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-8 md:px-8">
					<div>
						<h1 className="font-semibold text-2xl tracking-tight">Component gallery</h1>
						<p className="text-muted text-sm">
							Every export from @nowquant/nqui and its charts and sql entries laid out in one page.
							Switch the theme, market colors, and shape from the top bar.
						</p>
					</div>
					{sections.map((s) => (
						<section key={s.id} data-section={s.id} className="flex scroll-mt-6 flex-col gap-5">
							<div className="flex flex-col gap-1.5">
								<div className="flex items-baseline gap-3">
									<h2 className="font-semibold text-xl tracking-tight">{s.title}</h2>
									<span className="numeric text-muted text-xs">{s.components.length} exports</span>
								</div>
								<p className="text-muted text-sm">{s.description}</p>
								<div className="flex flex-wrap gap-1">
									{s.components.map((c) => (
										<Chip key={c} size="sm" variant="outline" className="font-mono">
											{c}
										</Chip>
									))}
								</div>
							</div>
							{s.render()}
						</section>
					))}
				</div>
			</div>
		</div>
	);
}
