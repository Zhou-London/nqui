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

## 0.4.1 - 2026-09-16

No changelog was kept before this file was added. See the commit history for 0.4.1
(2026-09-16), 0.4.0 (2026-09-11), 0.3.0 (2026-09-10), 0.2.0 (2026-09-09), and 0.1.0
(2026-09-09).
