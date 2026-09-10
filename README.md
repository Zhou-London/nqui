# NQUI

An original React component library for consoles, data warehouses, monitoring pages, and
finance UI. Built on React Aria Components and Tailwind CSS v4, with every color, radius, and
shadow defined as a CSS variable.

One npm package, five entry points, so projects that never import charts, the SQL editor,
Markdown, or the composer do not ship Recharts, lightweight-charts, CodeMirror, remark,
or Tiptap.

| Entry             | What it holds                                                                    |
| ----------------- | -------------------------------------------------------------------------------- |
| `@nowquant/nqui`            | Components, the virtualized `DataGrid`, data viewers, and finance widgets         |
| `@nowquant/nqui/charts`     | Line, area, bar, and donut charts on Recharts; candlesticks on lightweight-charts  |
| `@nowquant/nqui/sql`        | `SqlEditor` on CodeMirror 6 with schema completion, and `QueryWorkbench`          |
| `@nowquant/nqui/markdown`   | `Markdown` and the document-scale `MarkdownViewer` on react-markdown              |
| `@nowquant/nqui/editor`     | `Composer`, a prompt editor on Tiptap 3 with Markdown in and out                   |
| `@nowquant/nqui/theme.css`  | Tokens (`--nq-*` variables) plus the Tailwind `@theme inline` mapping             |
| `@nowquant/nqui/tokens.css` | The `--nq-*` variables alone, for a stylesheet that maps them itself              |
| `@nowquant/nqui/tailwind.css` | The `@theme inline` mapping alone, for a project that already loads the tokens  |
| `@nowquant/nqui/nqui.css`   | Prebuilt stylesheet for projects that do not run Tailwind                         |

## Use it

```bash
npm install @nowquant/nqui tailwindcss
```

```css
/* app.css */
@import "tailwindcss";
@import "@nowquant/nqui/theme.css";
```

`theme.css` registers the package's built components as a Tailwind content source, so no
`@source` line is needed. If you import `tokens.css` and `tailwind.css` separately, or map the
tokens yourself, add `@source "../node_modules/@nowquant/nqui/dist";` (relative to your
stylesheet) so Tailwind still generates the utilities the components use.

```tsx
import { Button, DataGrid, KpiCard, NquiProvider } from "@nowquant/nqui";
import { CandlestickChart } from "@nowquant/nqui/charts";
import { SqlEditor } from "@nowquant/nqui/sql";

export function App() {
	return (
		<NquiProvider market="us">
			<KpiCard label="Revenue" value="$228,441" delta={0.033} trend={[3, 5, 4, 8, 9]} />
			<Button color="primary">Download</Button>
		</NquiProvider>
	);
}
```

The palette is one primary scale, one gray scale, and four semantic colors; set
`--nq-color-primary` to rebrand and every tint, shade, and dark-mode role derives from it.
Dark mode is the `.dark` class (or `data-theme="dark"`) on `<html>`; `useTheme()` manages it.
`data-market="cn"` on any ancestor flips gain and loss colors for CJK markets.
Projects without Tailwind can import the prebuilt `@nowquant/nqui/nqui.css` instead; it includes
Tailwind's preflight reset, so expect it to normalize base element styles across the page.

Full component reference: [docs/guide.md](https://github.com/Zhou-London/nqui/blob/main/docs/guide.md).

## Develop

```bash
pnpm install
pnpm dev        # component gallery playground
pnpm build      # the nqui package plus the prebuilt stylesheet
pnpm typecheck
pnpm test
pnpm check      # biome lint + format
```
