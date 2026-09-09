import type { DataGridColumn } from "../data/data-grid";
import { formatCurrency } from "../utils/format";
import { DeltaChip } from "./price";
import { Sparkline } from "./sparkline";

/** Column presets for `DataGrid` in trading and portfolio tables. */
export const financeColumns = {
	symbol<T>(key: keyof T & string, extra: Partial<DataGridColumn<T>> = {}): DataGridColumn<T> {
		return {
			accessorKey: key,
			header: "Symbol",
			size: 120,
			pinned: "start",
			cell: ({ value }) => <span className="font-semibold text-foreground">{String(value)}</span>,
			...extra,
		};
	},
	price<T>(
		key: keyof T & string,
		extra: Partial<DataGridColumn<T>> & { currency?: string; decimals?: number } = {},
	): DataGridColumn<T> {
		const { currency, decimals = 2, ...rest } = extra;
		return currency
			? {
					accessorKey: key,
					header: "Price",
					format: "currency",
					currency,
					decimals,
					size: 120,
					...rest,
				}
			: {
					accessorKey: key,
					header: "Price",
					format: "number",
					decimals,
					numberOptions: { minimumFractionDigits: decimals },
					size: 120,
					...rest,
				};
	},
	/** Change ratio rendered as a tinted delta chip. */
	change<T>(key: keyof T & string, extra: Partial<DataGridColumn<T>> = {}): DataGridColumn<T> {
		return {
			accessorKey: key,
			header: "Change",
			numeric: true,
			size: 110,
			cell: ({ value }) =>
				typeof value === "number" ? <DeltaChip value={value} size="sm" /> : null,
			...extra,
		};
	},
	volume<T>(key: keyof T & string, extra: Partial<DataGridColumn<T>> = {}): DataGridColumn<T> {
		return { accessorKey: key, header: "Volume", format: "compact", size: 110, ...extra };
	},
	pnl<T>(
		key: keyof T & string,
		extra: Partial<DataGridColumn<T>> & { currency?: string } = {},
	): DataGridColumn<T> {
		const { currency = "USD", ...rest } = extra;
		return {
			accessorKey: key,
			header: "P&L",
			numeric: true,
			size: 130,
			cell: ({ value }) => {
				const v = Number(value);
				const cls = v > 0 ? "text-up-text" : v < 0 ? "text-down-text" : "text-muted";
				const text = formatCurrency(v, currency, { signDisplay: "exceptZero" });
				return <span className={cls}>{text}</span>;
			},
			...rest,
		};
	},
	/** Number series rendered as a sparkline. */
	trend<T>(key: keyof T & string, extra: Partial<DataGridColumn<T>> = {}): DataGridColumn<T> {
		return {
			accessorKey: key,
			header: "Trend",
			size: 140,
			enableSorting: false,
			cell: ({ value }) =>
				Array.isArray(value) ? (
					<Sparkline data={value as number[]} height={24} area={false} />
				) : null,
			...extra,
		};
	},
};
