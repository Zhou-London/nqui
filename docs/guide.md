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
| `@nowquant/nqui/theme.css`    | Tokens plus the Tailwind theme mapping                            |                                       |
| `@nowquant/nqui/tokens.css`   | Tokens only, for non-Tailwind theming                             |                                       |
| `@nowquant/nqui/nqui.css`     | Prebuilt stylesheet with every utility the components use         |                                       |

Import charts and SQL only where the page needs them. Their dependencies stay out of every
other bundle.

## Theming

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
`data-shape="soft"` increases it by half.

Override a token by redefining its variable after the theme import:

```css
:root {
	--nq-primary: oklch(0.55 0.2 300);
	--nq-radius-scale: 1.25;
}
```

Tailwind utilities map to the tokens: `bg-surface`, `text-muted`, `border-border`,
`bg-primary-soft`, `text-up-text`, `rounded-xl`, `shadow-md`, `font-mono`. Three extra
utilities exist: `glass` for frosted panels, `numeric` for tabular figures, and `shimmer`
for skeletons.

## Component families

Every component accepts `className`. Components built on React Aria also accept the React
Aria props of the element they wrap, such as `isDisabled`, `onPress`, and `href`.

### Actions

- `Button`: `variant` (`solid`, `soft`, `outline`, `ghost`, `link`), `color` (`accent`,
  `primary`, `neutral`, `success`, `warning`, `danger`, `info`), `size` (`xs` to `xl`),
  `radius`, `isPending`, `startContent`, `endContent`, `fullWidth`.
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
- `Menu` with `MenuItem` (`icon`, `description`, `shortcut`, `color="danger"`),
  `MenuSection`, `MenuSeparator`, `MenuTrigger`, `SubmenuTrigger`.
- `CommandPalette` with `CommandItem` and `CommandSection`; `useCommandShortcut` binds ⌘K.
- Toasts: call `toast.success(title, description, options)` from anywhere. Variants are
  `neutral`, `info`, `success`, `warning`, `danger`. `options.action` adds a button and
  `options.timeout` sets the dismiss delay. `NquiProvider` mounts the region.

### Navigation and layout

- `Tabs` with `TabList`, `Tab`, `TabPanel`: `variant` (`underline`, `segmented`, `soft`,
  `text`), `orientation`.
- `Breadcrumbs` with `Breadcrumb`, `Pagination`, `Accordion` with `AccordionItem`
  (`variant`: `divided`, `bordered`, `split`), `TimeRangeSelector`.
- `AppShell`: `sidebar`, `header`, `footer` slots around a scrolling main area.
- `Sidebar` with `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarItem`,
  `SidebarFooter`; `collapsed` turns the sidebar into an icon rail.
- `Navbar` with `NavbarBrand`, `NavbarContent`, `NavbarItem`: `variant` (`glass`, `solid`,
  `transparent`, `floating`).
- `PageHeader`, `PageContent`, `BottomNav` with `BottomNavItem`, `ScrollShadow`.

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

### Hooks and utilities

`useTheme`, `useMediaQuery`, `useIsMobile`, `useFlash`; `cn` merges Tailwind classes;
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
