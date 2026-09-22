# Changelog

All notable changes to `@nowquant/nqui`. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the package follows
[Semantic Versioning](https://semver.org/) (before 1.0, a minor version may break the API).

## Unreleased

Contains breaking changes; release it as 0.5.0.

### Breaking

- `react-aria-components` is now a peer dependency. Install it next to the package:
  `npm install react-aria-components`. The app and NQUI then share one copy, so React Aria's
  `RouterProvider`, `I18nProvider`, and contexts reach NQUI components.
- The build ships one file per source module instead of shared chunks. Only the paths in
  `exports` are public; an import of a chunk file under `dist/` breaks.
- With a Chinese locale (`zh-*`), the built-in strings now render in Simplified Chinese.
  Pass `messages={enMessages}` to `NquiProvider` to keep English.
- A pressable `Card` (`onPress` or `href`) no longer puts `role="button"` on its root. Its
  action is a button or link layered under the content; name it with `aria-label`.
  `cardStyles` no longer includes `focusRing`.
- A toast with an `action` no longer auto-dismisses unless `timeout` is set.
- `Table`'s default empty state reads "No rows" (no trailing period), matching `DataGrid`.
- Visual refresh (see "Changed" below): chart series colors, `TagGroup`'s default selection
  color, `SearchField`'s default shape, and the light canvas tone all changed.

### Added

- Localization: `NquiMessages`, `enMessages`, `zhCNMessages`, `messagesForLocale()`,
  `useMessages()`, and `NquiProvider`'s `messages` prop. Every string NQUI renders on its own
  (labels, placeholders, empty states, status text) comes from the catalog.
- `ref` on every React Aria based component's props type, pointing at the root element.
- `inputRef` on `TextField`, `SearchField`, `NumberField`, `ComboBox` (the `<input>`), and
  `TextArea` (the `<textarea>`), for form libraries that focus a field.
- Per-module `"use client"`: utilities (`cn`, `tv`, formatters, catalogs) and static
  components (`Markdown`, `Chip`, `Skeleton`, `EmptyState`, `StatusDot`, `KpiCard`, `Gauge`)
  work in React Server Components.
- CI runs Biome, the type checker, the tests, the build, and publint on every pull request.

### Changed

- One rule for "selected": values the user sets (checkbox, radio, switch, slider, tag) use
  the primary; where the user is (tabs, pagination, segments, time range) uses the accent.
  `TagGroup` now defaults to a soft primary selection (`color="neutral"` keeps the
  near-black fill), and `TimeRangeSelector` and `text` tabs mark the selection in neutral.
- Chart series `--nq-chart-1…6` are six categorical hues turned around the primary, checked
  for color-vision deficiency in both modes, in place of primary tints plus the status
  colors. Candlestick moving averages no longer share the up color.
- Avatar fallbacks use a lighter tint of two chart hues with initials in the same hue, which
  keeps contrast in both modes.
- Buttons no longer grow on hover; a press settles them to 97 %.
- `SearchField` defaults to the same box as the other fields; pass `variant="filled"
  radius="full"` for the toolbar pill (the DataGrid and LogViewer toolbars do).
- Filled fields use a translucent fill, so they read on a card and on the canvas.
- Unchecked checkboxes and radios use a new `--nq-control` border (about 3:1 on a card), and
  disabled ones stay visible as a filled box.
- Line, area, and bar charts format axis values compactly by locale ("2.5K") by default.
- Candlestick prices use the locale's grouping ("44,000.00"); the grid is horizontal-only
  and the volume series no longer labels the price axis.
- DataGrid columns default to a width suited to their format (dates, times, currency).
- Heatmap labels pick dark or light text from each cell's own lightness.
- Navbar rows that scroll fade their trailing edge.
- `PageHeader` titles step up to 32 px from `md`; the light canvas is a shade deeper, so
  white cards lift off it.

### Fixed

- Buttons and links inside a pressable `Card` are operable and exposed to screen readers.
- Toast buttons and the toast itself show a keyboard focus ring.
- `Avatar` shows a new `src` after an earlier one failed to load.
- `useCommandShortcut` no longer throws on key events without a `key` (autofill), and skips
  IME composition and keystrokes an editor already handled.
- `ScrollShadow` and `NavbarItem` no longer drop the caller's `ref`.
- A nested `NquiProvider` no longer mounts a second toast region, which showed every toast
  twice.
- The `FileUpload` done icon no longer repeats "Uploaded" to screen readers.
- A collapsed `AccordionItem` no longer keeps its panel's bottom padding.
- Vertical underline `Tabs` draw the selection bar on the trailing edge, not underneath.
- DataGrid selection checkboxes are no longer clipped by the cell padding.

## 0.4.1 - 2026-09-16

No changelog was kept before this file was added. See the commit history for 0.4.1
(2026-09-16), 0.4.0 (2026-09-11), 0.3.0 (2026-09-10), 0.2.0 (2026-09-09), and 0.1.0
(2026-09-09).
