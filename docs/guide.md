# NQUI guide

NQUI is a React component library for consoles, data warehouses, monitoring pages, and
finance UI. It builds on React Aria Components and Tailwind CSS v4. Every color, radius,
shadow, and font is a CSS variable, so themes change at runtime without a rebuild.

## Install

```bash
npm install @nowquant/nqui tailwindcss react react-dom
```

Import the theme in your Tailwind entry file and let Tailwind scan the package:

```css
@import "tailwindcss";
@import "@nowquant/nqui/theme.css";
@source "../node_modules/@nowquant/nqui/dist";
```

Projects without Tailwind import the prebuilt stylesheet instead of the two lines above:

```css
@import "@nowquant/nqui/nqui.css";
```

Wrap the app once. `NquiProvider` sets the locale, mounts the toast region, and applies the
market color convention:

```tsx
import { NquiProvider } from "@nowquant/nqui";

<NquiProvider locale="en-US" market="us">
	<App />
</NquiProvider>;
```

## Entry points

| Import              | Contents                                                        | Extra dependencies bundled            |
| ------------------- | --------------------------------------------------------------- | ------------------------------------- |
| `@nowquant/nqui`              | Components, DataGrid, data viewers, finance widgets, hooks, utils | none beyond React Aria and TanStack |
| `@nowquant/nqui/charts`       | LineChart, AreaChart, BarChart, DonutChart, CandlestickChart      | Recharts, lightweight-charts          |
| `@nowquant/nqui/sql`          | SqlEditor, QueryWorkbench                                         | CodeMirror 6                          |
| `@nowquant/nqui/markdown`     | Markdown, MarkdownViewer                                          | react-markdown, remark-gfm, rehype-slug |
| `@nowquant/nqui/editor`       | Composer                                                          | Tiptap 3                              |
| `@nowquant/nqui/theme.css`    | Tokens plus the Tailwind theme mapping                            |                                       |
| `@nowquant/nqui/tokens.css`   | Tokens only, for non-Tailwind theming                             |                                       |
| `@nowquant/nqui/nqui.css`     | Prebuilt stylesheet with every utility the components use         |                                       |

Import charts, SQL, Markdown, and the composer only where the page needs them. Their dependencies stay out of every
other bundle.

## Theming

### Colors

The color system has three kinds of color and nothing else: one primary scale, one neutral
gray scale, and four semantic colors. They are the palette inputs, the `--nq-color-*`
variables in `styles/tokens.css`, and the only literal colors in the library. Every other
color token is a role derived from them, so a brand sets one variable and every component,
chart, and both color schemes follow.

| Input                       | Default        | What it drives                                              |
| --------------------------- | -------------- | ----------------------------------------------------------- |
| `--nq-color-primary`        | blue           | Step 500 of the primary scale; the other eight steps derive |
| `--nq-color-primary-50…900` | derived        | 50 is the lightest tint, 900 the darkest shade              |
| `--nq-color-gray`           | cool mid gray  | Step 500 of the gray scale; the other eight steps derive    |
| `--nq-color-success`        | green          | `success`, `up`, and chart series 3                         |
| `--nq-color-error`          | red            | `error`, `down`, invalid fields, chart series 6             |
| `--nq-color-warning`        | amber          | `warning`, chart series 4                                   |
| `--nq-color-info`           | sky            | `info`, chart series 5                                      |

Set the primary to rebrand. The main color should be a mid-tone (lightness about 0.55 to
0.65) so the derived tints and shades keep their spacing:

```css
:root {
	--nq-color-primary: oklch(0.6 0.19 150); /* or any CSS color, e.g. #16a34a */
	--nq-color-gray: oklch(0.55 0.02 60); /* optional: a warmer gray */
	--nq-color-error: oklch(0.6 0.2 15); /* optional: retune a semantic color */
}
```

A single step can be hand-tuned by setting it directly, for example `--nq-color-primary-700`.

The gray scale carries every neutral role. Dark mode walks the same scale the other way:

| Role                    | Utility           | Light      | Dark       |
| ----------------------- | ----------------- | ---------- | ---------- |
| Primary text            | `text-foreground` | gray 900   | gray 100   |
| Secondary text          | `text-muted`      | gray 600   | gray 400   |
| Helper text, captions   | `text-subtle`     | gray 500   | gray 500   |
| Disabled text and icons | `text-disabled`   | gray 400   | gray 600   |
| Canvas                  | `bg-background`   | gray 50    | gray 900   |
| Cards                   | `bg-surface`      | white      | gray 850   |
| Hover and pressed fills | `bg-surface-2/3`  | gray 100/200 | gray 800/750 |
| Borders                 | `border-border`   | gray 200   | gray 100 at 9% |

`accent`, the near-black fill of the default button, is the darkest gray step in light mode
and the lightest in dark mode.

Each color role comes in four forms, mapped to utilities as `bg-success`,
`text-success-foreground` (text on the solid fill), `bg-success-soft` (tint), and
`text-success-text` (text on the tint or on the canvas). In dark mode the solid fill is
lifted in lightness and the text shade is paled, so the same four utilities read well on a
dark canvas. Only the primary exposes its scale as utilities (`bg-primary-100`,
`text-primary-700`); the gray scale and the semantic colors are reached through their roles.

### Color scheme, market, and shape

Dark mode is the `dark` class or `data-theme="dark"` on `<html>`. `useTheme()` toggles it,
persists the choice, and follows the OS setting while the choice is `system`:

```tsx
const { resolved, toggle, setScheme } = useTheme();
```

Add `themeInitScript` to `<head>` to apply the stored scheme before the first paint.

Market colors follow the western convention by default: green for gains, red for losses.
Set `data-market="cn"` on any ancestor, or `market="cn"` on `NquiProvider`, to paint gains
red and losses green. Components read the `--nq-up` and `--nq-down` variables, so the switch
covers chips, prices, order books, and charts at once.

Shape presets scale every radius. `data-shape="sharp"` removes rounding and
`data-shape="soft"` increases it by half. `--nq-radius-scale` sets any other factor.

Tailwind utilities map to the tokens: `bg-surface`, `text-muted`, `border-border`,
`bg-primary-soft`, `text-up-text`, `rounded-xl`, `shadow-md`, `font-mono`. Three extra
utilities exist: `glass` for frosted panels, `numeric` for tabular figures, and `shimmer`
for skeletons.

## Component families

Every component accepts `className`. Components built on React Aria also accept the React
Aria props of the element they wrap, such as `isDisabled`, `onPress`, and `href`.

### Actions

- `Button`: `variant` (`solid`, `soft`, `outline`, `ghost`, `link`), `color` (`accent`,
  `primary`, `neutral`, `success`, `warning`, `error`, `info`), `size` (`xs` to `xl`),
  `radius`, `startContent`, `endContent`, `fullWidth`. Five states, each styled in every
  variant: default; hover (a lighter fill, or an underline for `link`, scaled to 1.05);
  pressed (a deeper fill, scaled to 0.95); loading (`isLoading`, or React Aria's
  `isPending`: a spinner replaces the label at the same size and presses are ignored);
  disabled (`isDisabled`: faded to 45% with no pointer events). `disabledReason` disables
  the button and prints the reason on it after the label, in lighter text; an icon-only
  button widens to show it.
- `IconButton`: a square `Button`; `aria-label` is required.
- `ButtonGroup`: joins buttons into one segmented pill.
- `ToggleButton`, `ToggleButtonGroup`: pressed state with single or multiple selection.
- `Link`: `variant` (`primary`, `foreground`, `muted`, `underline`); routes through
  `NquiProvider`'s `navigate` when given.

### Display

- `Chip`: `variant` (`soft`, `solid`, `outline`, `dot`), `color` including `up` and `down`.
- `Badge`: count bubble anchored to a child; `content`, `max`, `placement`.
- `Avatar`, `AvatarGroup`: image, initials, or a deterministic gradient from `name`;
  `status` dot; `max` and `total` on the group.
- `StatusDot`: `status` (`healthy`, `degraded`, `down`, `unknown`, `running`, `pending`),
  `pulse`, `label`.
- `Card` with `CardHeader`, `CardTitle`, `CardBody`, `CardFooter`: `variant` (`outline`,
  `elevated`, `flat`, `glass`, `ghost`), `isPressable`.
- `Kbd`, `Code`, `Divider`, `Tooltip` with `TooltipTrigger`.
- `Chat` with `ChatMessage`, `ChatAvatar`, `ChatBubble`, `ChatActions`, `ChatAction`:
  a transcript where `from="user"` is a right-aligned bubble and `from="assistant"` is avatar
  plus text. `ChatActions` shows copy, rating, and regenerate for whichever of `copyText`,
  `onFeedbackChange`, and `onRegenerate` is passed; `isPending` draws a streaming cursor.

### Forms

Every field takes `label`, `description`, `errorMessage`, `size`, `variant` (`outline`,
`filled`), and `radius`. Validation state comes from React Aria: pass `isInvalid` or use
`Form` with native validation.

- Text: `TextField`, `TextArea` (`autoResize`), `SearchField`, `NumberField`
  (`formatOptions` accepts `Intl.NumberFormat` options).
- Choice: `Select` with `SelectItem`, `ComboBox` with `ComboBoxItem`, `Checkbox`,
  `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `Slider` (array value for a range),
  `TagGroup` with `Tag`.
- Dates: `DatePicker`, `DateRangePicker`, `Calendar`, `RangeCalendar`. Values are
  `@internationalized/date` objects.
- `Select` shows the selected item's text. Pass `renderValue` to show icons or descriptions.
- Files: `FileUpload` is a drop area with a browse button and a list of files; `UploadButton`
  is the same picker as a plain button. Both take `accept` (extensions, MIME types, or
  `image/*`), `multiple`, `maxSize` in bytes, and `maxFiles`, and call `onSelect` with the
  files that pass; `onReject` receives the rest with a reason. The application uploads the
  files and reports back through `files: { id, name, size, status, progress, error }[]`
  and `onRemove`. Browser MIME data is advisory; validate types on the server as well.

### Overlays

- `Modal` and `Dialog` with `DialogHeader`, `DialogBody`, `DialogFooter`; open with
  `DialogTrigger` or control `isOpen`. `size` from `xs` to `full`.
- `Drawer`: `placement` (`right`, `left`, `bottom`, `top`); `bottom` renders a sheet handle.
- `Popover` with `PopoverTrigger`; `showArrow`.
- `Menu` with `MenuItem` (`icon`, `description`, `shortcut`, `color="error"`),
  `MenuSection`, `MenuSeparator`, `MenuTrigger`, `SubmenuTrigger`.
- `CommandPalette` with `CommandItem` and `CommandSection`; `useCommandShortcut` binds ⌘K.
- Toasts: call `toast.success(title, description, options)` from anywhere. Variants are
  `neutral`, `info`, `success`, `warning`, `error`. `options.action` adds a button and
  `options.timeout` sets the dismiss delay. `NquiProvider` mounts the region.

### Navigation and layout

- `Tabs` with `TabList`, `Tab`, `TabPanel`: `variant` (`underline`, `segmented`, `soft`,
  `text`), `orientation`.
- `Breadcrumbs` with `Breadcrumb`, `Pagination`, `Accordion` with `AccordionItem`
  (`variant`: `divided`, `bordered`, `split`), `TimeRangeSelector`.
- `AppShell`: `sidebar`, `header`, `footer` slots around a scrolling main area. See
  [Console layout](#console-layout) below.
- `Sidebar` with `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarItem`,
  `SidebarFooter`; `collapsed` turns the sidebar into an icon rail. `resizable` adds a drag
  handle on the edge (arrow keys resize, double-click resets; `minWidth`, `maxWidth`,
  `defaultWidth`, `width` / `onWidthChange`). `hidden` / `defaultHidden` / `onHiddenChange`
  control the hide state; `SidebarProvider` shares it with triggers outside the sidebar
  (`AppShell` mounts one), and `useSidebar()` reads it. `SidebarSubmenu` (`icon`, `label`,
  `badge`, `isActive`, `defaultExpanded` / `isExpanded` / `onExpandedChange`) is an
  expandable parent whose children sit indented behind a guide line; nest them for deeper
  trees. `chevron` on a `SidebarItem` adds a trailing arrow for rows that open a deeper page.
- `SidebarTrigger` hides and shows the sidebar. Place it in the shell's top bar or in the
  sidebar header; the two placements behave differently, see below.
- `Navbar` with `NavbarBrand`, `NavbarContent`, `NavbarItem`: `variant` (`glass`, `solid`,
  `transparent`, `floating`). A `start` or `center` `NavbarContent` scrolls sideways once
  its items outgrow the bar; an `end` one keeps its width at the trailing edge.
- `PageHeader` (`title`, `description`, `eyebrow`, `actions`, `tabs`), `PageContent`,
  `BottomNav` with `BottomNavItem` (`hideFromMd` hides the bar from the `md` tier up, where
  the sidebar takes over), `ScrollShadow`.

#### Console layout

`AppShell` places the sidebar on the left and stacks the top bar, the scrolling page, and
an optional footer in the content column. Put a transparent `Navbar` in the `header` slot
with the `SidebarTrigger`, breadcrumbs, and the account menu. The page starts below that
bar, whether the sidebar is open or hidden:

```tsx
<AppShell
	sidebar={
		<Sidebar resizable>
			<SidebarHeader>…brand switcher…</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarItem icon={<House />} isActive>Overview</SidebarItem>
					<SidebarItem icon={<Mic />}>Episodes</SidebarItem>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	}
	header={
		<Navbar variant="transparent" position="static">
			<SidebarTrigger />
			<Breadcrumbs>
				<Breadcrumb icon={<House />}>Overview</Breadcrumb>
			</Breadcrumbs>
			<NavbarContent justify="end">
				<Avatar name="Nora Kim" size="sm" />
			</NavbarContent>
		</Navbar>
	}
>
	<PageContent>…cards…</PageContent>
</AppShell>
```

Below `md` (768 px) the `Sidebar` itself becomes a modal drawer, with or without an
`AppShell`. The same `SidebarTrigger` opens it; a trigger inside `SidebarHeader` closes it,
and when there is none the drawer adds a close button. Choosing a `SidebarItem` in the
drawer closes it as well, and so do Escape and the backdrop. The drawer ignores `collapsed` and `resizable` and keeps its own open state, so the
column's hide state and width are exactly as you left them when the viewport grows again.

A `SidebarTrigger` outside the sidebar keeps its spot on the top bar while the sidebar is
hidden, so the same button brings the sidebar back and nothing overlaps the page.

A `SidebarTrigger` inside `SidebarHeader` hides together with the sidebar. The sidebar then
shows a floating reopen button on the header row, on every tier, and `PageHeader` and
`Navbar` pad their leading edge to make room for that button. `showReopen={false}` on the `Sidebar` turns the
floating button off; provide another way back in that case.

`PageContent` adds the gap below the top bar or a `PageHeader` and keeps the same
horizontal padding as `PageHeader`. Use `PageHeader` for pages that need a title row,
description, actions, or tabs; pages whose title is the breadcrumb start with
`PageContent` directly, as above.

### Feedback

`Alert` (`color`, `variant`, `actions`, `onClose`), `ProgressBar` (`isIndeterminate`),
`Meter` (`thresholds` change the color as the bar fills), `Spinner`, `Skeleton`,
`SkeletonText`, `EmptyState`.

### Tables

`Table` wraps the React Aria table for short lists with sorting, selection, and resizing.
Use `TableContainer`, `TableHeader`, `Column`, `TableBody`, `Row`, and `Cell`.

`DataGrid` renders large data sets. Columns are plain objects:

```tsx
const columns: DataGridColumn<Trade>[] = [
	{ accessorKey: "symbol", header: "Symbol", pinned: "start" },
	{ accessorKey: "price", header: "Price", format: "currency", currency: "USD" },
	{ accessorKey: "change", header: "Change", format: "deltaPercent" },
	{ id: "actions", header: "", cell: ({ row }) => <RowMenu trade={row} /> },
];

<DataGrid columns={columns} data={trades} getRowId={(t) => t.id} selectionMode="multiple" toolbar />;
```

Key props: `format` (`number`, `integer`, `compact`, `currency`, `percent`, `delta`,
`deltaPercent`, `bytes`, `duration`, `date`, `datetime`, `time`, `boolean`) on a column;
`sorting` and `onSortingChange`, `globalFilter`, `selectionMode`, `onSelectionChange`,
`columnVisibility`, `enableResizing`, `density`, `striped`, `bordered`, `height`,
`virtualize` (`auto` switches on above 200 rows), `pagination`, `toolbar`, `showFooter`,
`isLoading`, `emptyState`, `onRowAction` on the grid. Arrow keys move between cells; Enter
fires `onRowAction`; Space toggles selection.

The toolbar pairs the search box with a Filter button. Its panel lists every filterable
column: text columns get a contains field, numeric formats a min/max pair, and boolean
columns or columns with `filterOptions` a checklist. Set `filter: "select"` on a text
column to build the checklist from the distinct values in `data`, or `filter: false` to
leave a column out. Active filters show as removable chips and reset the page. Read or
control them with `columnFilters`, `defaultColumnFilters`, and `onColumnFiltersChange`;
each entry is `{ id, value }` where `value` is a string, a `[min, max]` pair with `null`
for an open end, or the chosen strings. With `manualFiltering` the caller applies them.

### Data

- `DataPreview`: summary strip, sample rows, and a schema tab with per-column statistics.
  `inferSchema(rows)` produces the column metadata when the source has none.
- `SchemaTree`: databases, schemas, tables, and typed columns; `filter` narrows the tree.
- `JsonViewer`: collapsible syntax-colored tree with a copy button.
- `LogViewer`: virtualized log lines with level filters, search, and follow-tail.

### Finance

- `PriceText`: tabular price with `animate`, `flash` on change, and `trend` coloring.
- `DeltaChip`: signed change as a tinted pill; `absolute`, `invert`, `variant`.
- `KpiCard`: label, value, delta, and a `trend` sparkline. `Stat` is the inline form.
- `Sparkline`: `data`, `color` (`auto` follows the direction), `area`, `baseline`.
- `OrderBook`: `bids`, `asks` as `[price, size]` pairs; `layout` (`stacked`, `split`).
- `DepthChart`, `TickerTape`, `Gauge`, `Heatmap` (`scale`: `diverging`, `sequential`),
  `UptimeBar`, `LatencyBadge`.
- `financeColumns`: DataGrid column presets `symbol`, `price`, `change`, `volume`, `pnl`,
  `trend`.

### Charts (`@nowquant/nqui/charts`)

`LineChart`, `AreaChart`, and `BarChart` share one shape: `data`, `xKey`, and `series`
(`{ key, name, color, dashed, stackId }`). Formatters: `xFormatter`, `yFormatter`,
`tooltipFormatter`. `referenceY` draws a target line. `BarChart` adds `layout="horizontal"`.
`DonutChart` takes `{ name, value }` slices with a center total. `CandlestickChart` takes
`{ time, open, high, low, close, volume }` candles with `showVolume` and `movingAverages`.
Colors come from `--nq-chart-1` to `--nq-chart-6`; `useChartTheme` resolves them for
canvas renderers.

### SQL (`@nowquant/nqui/sql`)

`SqlEditor` props: `value` or `defaultValue`, `onChange`, `dialect` (`postgresql`, `mysql`,
`sqlite`, `mssql`, and others), `schema` for completion, `onRun` (⌘↵ passes the selection
when text is selected), `toolbar`, `readOnly`, `lineWrapping`. `QueryWorkbench` adds a
results grid and status line; `onRun` returns `{ columns, rows, elapsedMs }` or throws to
show an error.

### Markdown (`@nowquant/nqui/markdown`)

`Markdown` renders a string with react-markdown and remark-gfm (tables, task lists,
strikethrough, autolinks) using NQUI typography: inline code becomes `Code`, links become
`Link`. Raw HTML in the source is dropped. Override one tag with `components`, or add
`remarkPlugins` and `rehypePlugins`.

`MarkdownViewer` is the reading view for a whole document. It draws no card, border, or
scroll container and does not virtualize: the blocks sit on the page background in normal
flow, so browser find, print, and `#anchor` links work on the full text. Headings get ids
from `rehype-slug` with a hover anchor, code blocks get a language tag and a copy button,
and `empty` renders for blank input.

Install the peers: `npm install react-markdown remark-gfm rehype-slug`.

### Composer (`@nowquant/nqui/editor`)

`Composer` is the prompt editor for chat and comment boxes, with the toolbar on top: attach
image, Markdown preview, undo / redo, bold / italic / underline, heading 1 / heading 2 /
paragraph, and send. The text area is Tiptap, and the document round-trips as Markdown
through `@tiptap/markdown`, so `value`, `defaultValue`, `onChange`, and `onSubmit` all speak
Markdown (`onSubmit` receives `{ value, html, files }`). Enter starts a new paragraph and
Cmd/Ctrl+Enter sends; `submitOnEnter` flips that so Enter sends and Shift+Enter breaks a line. `renderPreview` enables the preview toggle (pair it with
`Markdown`), `formatting={false}` hides the format buttons, `attachments` (default on,
`accept` images) controls the attach button and thumbnails. With every control off the
toolbar row goes away and the send button sits beside the text, which is the shape of a
reply box. Install the peers:
`npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/markdown`.

### Hooks and utilities

`useTheme`, `useMediaQuery`, `useBreakpoint`, `useBelowBreakpoint`, `useFlash`; `cn` merges Tailwind classes;
`tv` is tailwind-variants with the NQUI merge config; formatters `formatNumber`,
`formatCompact`, `formatCurrency`, `formatPercent`, `formatDelta`, `formatBytes`,
`formatDuration`, `formatFixed`, and `trendOf`.

## Playground

`pnpm dev` starts a gallery that renders every export with theme, market, and shape
switches. Read `apps/playground/src/pages/Components.tsx` for a working example of each
component.

## Scale

Spacing and type sit on two fixed scales, checked by `src/__tests__/scale.test.ts`.

Padding, margin, and gap use 4 / 8 / 16 / 24 / 32 / 48 / 64 px only, which are the Tailwind
steps `1 2 4 6 8 12 16`. Control heights follow the same 8 px grid: `sm` 32, `md` 40, `lg` 48,
with `xs` 24 and `xl` 56 on `Button`. Table and DataGrid rows are 32 / 40 / 48 for the
compact, comfortable, and spacious densities.

Font sizes have seven steps. `theme.css` resets Tailwind's text scale and defines only these,
so a class outside the scale produces no CSS:

| Class      | Size  | Use                                   |
| ---------- | ----- | ------------------------------------- |
| `text-xs`  | 12 px | Captions, chips, table headers        |
| `text-sm`  | 14 px | Body text, inputs, buttons            |
| `text-base`| 16 px | Card titles, large buttons            |
| `text-xl`  | 20 px | Dialog titles, small KPI values       |
| `text-2xl` | 24 px | KPI values, page headings             |
| `text-3xl` | 32 px | Large KPI values, hero prices         |
| `text-5xl` | 48 px | Display numbers                       |

## Breakpoints

Five viewport tiers, declared in `styles/tailwind.css` and exported as `breakpoints`:

| Tier | From    | Tailwind variant   | Typical device                     |
| ---- | ------- | ------------------ | ---------------------------------- |
| `xs` | 320 px  | `xs:` (always on)  | Phone; the smallest supported width |
| `sm` | 576 px  | `sm:` / `max-sm:`  | Large phone                        |
| `md` | 768 px  | `md:` / `max-md:`  | Tablet                             |
| `lg` | 992 px  | `lg:` / `max-lg:`  | Tablet landscape, small laptop     |
| `xl` | 1200 px | `xl:` / `max-xl:`  | Desktop                            |

Tailwind's stock breakpoints are removed, so `2xl:` produces no CSS. `useBreakpoint()` returns
the current tier, `useBelowBreakpoint(tier)` is true below that tier (the `Sidebar` drawer
reads `md`, `DataGrid` row heights read `lg`), and `minWidthQuery` / `maxWidthQuery` build
the matching media queries for `useMediaQuery`. Nothing inspects the device: every change
of form follows one of these five widths.

Components change gear at these tiers only where a layout needs it:

- `Sidebar` is a column from `md`; below that it is a drawer, with or without an
  `AppShell`, and the same `SidebarTrigger` opens it (see [Console layout](#console-layout)).
  `PageHeader` and `PageContent` use 16 px side padding, 32 px from `md`, and cap at
  `max-w-page` (1200 px, centered) so content does not stretch across wide screens.
- `NavbarContent` scrolls sideways once its items outgrow the bar, at any width, instead of
  running under the brand or the trailing actions, and the active `NavbarItem` scrolls
  itself into view.
- The `Sidebar` resize handle widens to 44 px below `lg` and stays beneath the controls on
  either side of the edge, so a tap on them presses the control rather than starting a drag.
- `Modal` docks to the bottom edge at full width below `sm` and slides up; from `sm` it is a
  centered card. `CommandPalette` stays top-anchored and goes full width below `sm`.
- `Pagination` keeps only the arrows and the current page below `sm`; `TabList` scrolls
  sideways below `sm` instead of widening the page.
- `DataGrid` resolves an unset `density` to `spacious` below `lg`, and every control below
  `lg` offers a 44 px touch target (next section).

Test layouts at 320, 768, and 1200 px at least; `src/__tests__/breakpoints.test.tsx` checks
the tier values and the hooks at those widths, and `src/__tests__/sidebar-drawer.test.tsx`
covers the sidebar below `md`.

## Touch targets

Below the `lg` tier (992 px) every control offers at least 44 x 44 px. Visual sizes stay on
the 32 / 40 / 48 scale; the extra area comes from two mechanisms that only apply below `lg`:

- `touch-target` adds an invisible 44 x 44 px hit area centered on the control. Buttons,
  toggle buttons, tabs, checkboxes, radios, switches, slider thumbs, tags, sidebar and navbar
  items, breadcrumbs, calendar arrows, and toast buttons carry it. The element must be
  positioned (`relative` or `absolute`). Inline `Link`s and `variant="link"` buttons skip it,
  because a hit area taller than the line would cover the neighboring text.
- Contiguous rows grow instead, so hit areas never overlap: menu and list options, tree rows,
  accordion triggers, calendar cells, table rows and headers, order book levels, and ticker
  items become 44 px tall; `sm` and `md` field boxes grow to 44 px and the buttons inside
  them (clear, stepper, calendar, combo box toggle) widen to 44 px. `DataGrid` uses 48 px
  rows and a 44 px header unless `density` is set. Resize handles widen to 44 px around
  their edge line, beneath any control they overlap, so a tap on that control is not a drag.

`src/__tests__/touch-target.test.ts` checks the shared recipes. When you add a control
smaller than 44 px, give it `relative touch-target`, or `max-lg:min-h-11` if it sits in a
contiguous list. `Heatmap` cells take their size from `cellSize`; pass 44 or more when cells
are pressable below `lg`.

## Density

`NquiProvider density="compact"` sets smaller defaults for buttons, text inputs,
select triggers, and DataGrid rows. Explicit `size`, `radius`, and grid `density`
props override these defaults. Comfortable remains the default.

Use outline cards for bordered sections, flat cards for grouped content on a tinted
surface, and elevated cards for raised surfaces. Glass cards need content behind
them to make the translucency visible; avoid mixing these treatments at the same
level of a page.

### Server data and selection

```tsx
const [paginationState, onPaginationChange] = useState({ pageIndex: 0, pageSize: 25 });
const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({});

<DataGrid
  columns={columns}
  data={response.rows}
  getRowId={(row) => row.id}
  pagination={{ pageSizeOptions: [10, 25, 50, 100] }}
  paginationState={paginationState}
  onPaginationChange={onPaginationChange}
  rowCount={response.total}
  manualPagination
  manualFiltering
  manualSorting
  selectionMode="multiple"
  selectedRowIds={selectedRowIds}
  onSelectionChange={setSelectedRowIds}
/>
```

Fetch data when the controlled pagination, sorting, or filters change. The grid resets
`pageIndex` to zero when a toolbar filter changes; do the same for filters you apply
outside the grid. `rowCount` is the filtered total.
Use stable row IDs across pages. Selection IDs retain off-page selections; the
callback's second argument contains selected row objects available in `data`.
In server mode, Select all toggles the current page and preserves other pages.
In client mode, it toggles all filtered rows. Client page-size choices persist
until the `pagination.pageSize` prop changes.
