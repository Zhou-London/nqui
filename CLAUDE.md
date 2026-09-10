# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

NQUI: an original UI kit inspired only by the look of HeroUI Pro (white cards on a light gray
canvas, hairline borders, pill buttons, a near-black accent plus one bright blue, tinted status
chips). Do not read HeroUI source, docs, or packages; it is closed source and this library must
stay original. Spec: `instrution.md`.

## Layout

```
packages/nqui/styles   CSS only: tokens.css (--nq-* variables), tailwind.css (@theme inline mapping)
packages/nqui/src      components/, data/ (DataGrid, DataPreview, ...), finance/, hooks/, utils/
packages/nqui/src/charts   entry `@nowquant/nqui/charts`: Recharts wrappers + lightweight-charts candlestick
packages/nqui/src/sql      entry `@nowquant/nqui/sql`: CodeMirror 6 SQL editor + QueryWorkbench
apps/playground        Vite app with the component gallery; aliases nqui, nqui/charts, nqui/sql to sources
```

## Commands

`pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm check` (Biome). There is one
published package, `@nowquant/nqui`, with three tsdown entries (`index`, `charts`, `sql`); the charts and
sql folders import from the rest of `src` with relative paths, never through the barrel.

## Conventions

- Styles are `tv()` recipes from `utils/tv.ts` (tailwind-merge is configured there; register any
  new custom utility class group in `utils/cn.ts`).
- React Aria state is styled through the `tailwindcss-react-aria-components` variants
  (`pressed:`, `selected:`, `entering:`); never hand-roll hover/focus JS.
- Spacing (padding, margin, gap) uses only 4/8/16/24/32/48/64 px (`1 2 4 6 8 12 16`); font
  sizes only the seven steps in `tailwind.css` (`xs sm base xl 2xl 3xl 5xl`). Control heights
  are `sm` 32 / `md` 40 / `lg` 48. `src/__tests__/scale.test.ts` fails on anything else.
- Breakpoints are the five tiers 320 / 576 / 768 / 992 / 1200 px (`xs sm md lg xl`, no
  `2xl`), declared in `tailwind.css` and exported as `breakpoints`. Change a layout only at
  a tier, cap pages with `max-w-page` (1200 px), and check 320, 768, and 1200 px.
  `src/__tests__/breakpoints.test.tsx` guards the values.
- Touch targets are at least 44 px below `lg` without changing the visual scale: give a
  control smaller than 44 px `relative touch-target` (invisible centered hit area), or
  `max-lg:min-h-11` when it sits in a contiguous list. Guarded by
  `src/__tests__/touch-target.test.ts`; see "Touch targets" in `docs/guide.md`.
- The palette is fixed: `--nq-color-primary` (nine derived steps), `--nq-color-gray` (nine
  steps), and `--nq-color-success` / `error` / `warning` / `info`. A new color token in
  `tokens.css` is a role derived from those with `var()`, `color-mix()`, or relative
  `oklch(from …)`, set for light and for dark, then mapped by one line in `tailwind.css`;
  `src/__tests__/colors.test.ts` fails on a literal chromatic color anywhere else. The error
  color is `error`, never `danger`. Utilities must reference variables, never raw values.
- Canvas renderers (lightweight-charts) cannot parse `oklch()`; pass colors through `toRgba()`
  in `src/charts/theme.ts`.
- The `DataGrid` is a div-based grid so rows can be absolutely positioned by the virtualizer;
  Biome's semantic-element rules are switched off for that file only.
- TypeScript 7 is the native compiler: `types` defaults to empty and `rootDir` to the package
  root, so keep every source file under `packages/nqui/src`.
- pnpm 12 blocks dependency build scripts until listed under `allowBuilds` in
  `pnpm-workspace.yaml`.
