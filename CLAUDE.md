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
- New colors go in `tokens.css` as `--nq-*` for light and dark, then get one line in
  `tailwind.css` under `@theme inline`. Utilities must reference variables, never raw values.
- Canvas renderers (lightweight-charts) cannot parse `oklch()`; pass colors through `toRgba()`
  in `src/charts/theme.ts`.
- The `DataGrid` is a div-based grid so rows can be absolutely positioned by the virtualizer;
  Biome's semantic-element rules are switched off for that file only.
- TypeScript 7 is the native compiler: `types` defaults to empty and `rootDir` to the package
  root, so keep every source file under `packages/nqui/src`.
- pnpm 12 blocks dependency build scripts until listed under `allowBuilds` in
  `pnpm-workspace.yaml`.
