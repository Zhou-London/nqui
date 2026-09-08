# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

NQUI: an original UI kit inspired only by the look of HeroUI Pro (white cards on a light gray
canvas, hairline borders, pill buttons, a near-black accent plus one bright blue, tinted status
chips). Do not read HeroUI source, docs, or packages; it is closed source and this library must
stay original. Spec: `instrution.md`.

## Layout

```
packages/theme     CSS only: tokens.css (--nq-* variables), tailwind.css (@theme inline mapping)
packages/react     components/, data/ (DataGrid, DataPreview, ...), finance/, hooks/, utils/
packages/charts    Recharts wrappers + lightweight-charts candlestick
packages/sql       CodeMirror 6 SQL editor + QueryWorkbench
apps/playground    Vite app with the component gallery; aliases @nqui/* to package sources
```

## Commands

`pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm check` (Biome). Packages build
in dependency order; charts and sql type-check against `packages/react/dist`, so build react
first after changing its public types.

## Conventions

- Styles are `tv()` recipes from `utils/tv.ts` (tailwind-merge is configured there; register any
  new custom utility class group in `utils/cn.ts`).
- React Aria state is styled through the `tailwindcss-react-aria-components` variants
  (`pressed:`, `selected:`, `entering:`); never hand-roll hover/focus JS.
- New colors go in `tokens.css` as `--nq-*` for light and dark, then get one line in
  `tailwind.css` under `@theme inline`. Utilities must reference variables, never raw values.
- Canvas renderers (lightweight-charts) cannot parse `oklch()`; pass colors through `toRgba()`
  in `@nqui/charts`.
- The `DataGrid` is a div-based grid so rows can be absolutely positioned by the virtualizer;
  Biome's semantic-element rules are switched off for that file only.
- TypeScript 7 is the native compiler: `types` defaults to empty and `rootDir` to the package
  root, so cross-package `paths` mappings do not work; rely on built `dist` types instead.
- pnpm 12 blocks dependency build scripts until listed under `allowBuilds` in
  `pnpm-workspace.yaml`.
