# NQUI

An original React component library for consoles, data warehouses, monitoring pages, and
finance UI. Built on React Aria Components and Tailwind CSS v4, with every color, radius, and
shadow defined as a CSS variable.

| Package        | What it holds                                                                 |
| -------------- | ----------------------------------------------------------------------------- |
| `@nqui/theme`  | Tokens (`tokens.css`) and the Tailwind `@theme inline` mapping (`tailwind.css`) |
| `@nqui/react`  | Components, the virtualized `DataGrid`, data viewers, and finance widgets       |
| `@nqui/charts` | Line, area, bar, and donut charts on Recharts; candlesticks on lightweight-charts |
| `@nqui/sql`    | `SqlEditor` on CodeMirror 6 with schema completion, and `QueryWorkbench`        |

## Use it

```bash
pnpm add @nqui/react @nqui/theme tailwindcss
```

```css
/* app.css */
@import "tailwindcss";
@import "@nqui/theme";
@source "../node_modules/@nqui/react/dist";
```

```tsx
import { Button, DataGrid, KpiCard, NquiProvider } from "@nqui/react";

export function App() {
	return (
		<NquiProvider market="us">
			<KpiCard label="Revenue" value="$228,441" delta={0.033} trend={[3, 5, 4, 8, 9]} />
			<Button color="primary">Download</Button>
		</NquiProvider>
	);
}
```

Dark mode is the `.dark` class (or `data-theme="dark"`) on `<html>`; `useTheme()` manages it.
`data-market="cn"` on any ancestor flips gain and loss colors for CJK markets.
Projects without Tailwind can import the prebuilt `@nqui/theme/nqui.css` instead.

## Develop

```bash
pnpm install
pnpm dev        # component gallery playground
pnpm build      # all packages plus the prebuilt stylesheet
pnpm typecheck
pnpm test
pnpm check      # biome lint + format
```
