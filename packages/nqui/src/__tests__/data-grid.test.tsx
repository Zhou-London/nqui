import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataGrid, type DataGridColumn, formatCellValue } from "../data/data-grid";

interface Row {
	id: string;
	symbol: string;
	price: number;
	change: number;
}

const columns: DataGridColumn<Row>[] = [
	{ accessorKey: "symbol", header: "Symbol" },
	{ accessorKey: "price", header: "Price", format: "currency" },
	{ accessorKey: "change", header: "Change", format: "deltaPercent" },
];

const data: Row[] = [
	{ id: "a", symbol: "ETH", price: 3512.18, change: -0.0087 },
	{ id: "b", symbol: "BTC", price: 68412.5, change: 0.0231 },
	{ id: "c", symbol: "SOL", price: 213.42, change: 0.0542 },
];

function rowTexts(): string[] {
	return screen
		.getAllByRole("row")
		.slice(1)
		.map((r) => within(r).getAllByRole("gridcell")[0]?.textContent ?? "");
}

describe("DataGrid", () => {
	it("renders one header row plus a row per record", () => {
		render(<DataGrid aria-label="Grid" columns={columns} data={data} getRowId={(r) => r.id} />);
		expect(screen.getByRole("grid", { name: "Grid" })).toBeTruthy();
		expect(screen.getAllByRole("row")).toHaveLength(4);
		expect(rowTexts()).toEqual(["ETH", "BTC", "SOL"]);
	});
	it("sorts when a header is clicked", () => {
		render(<DataGrid aria-label="Grid" columns={columns} data={data} getRowId={(r) => r.id} />);
		fireEvent.click(screen.getByRole("columnheader", { name: /Symbol/ }));
		expect(rowTexts()).toEqual(["BTC", "ETH", "SOL"]);
		fireEvent.click(screen.getByRole("columnheader", { name: /Symbol/ }));
		expect(rowTexts()).toEqual(["SOL", "ETH", "BTC"]);
	});
	it("filters with the toolbar search", () => {
		render(
			<DataGrid aria-label="Grid" columns={columns} data={data} getRowId={(r) => r.id} toolbar />,
		);
		fireEvent.change(screen.getByRole("searchbox"), { target: { value: "sol" } });
		expect(rowTexts()).toEqual(["SOL"]);
	});
	it("does not fire the row action when Enter sorts a header", () => {
		const onRowAction = vi.fn();
		render(
			<DataGrid
				aria-label="Grid"
				columns={columns}
				data={data}
				getRowId={(r) => r.id}
				onRowAction={onRowAction}
			/>,
		);
		const cell = screen.getAllByRole("gridcell")[0] as HTMLElement;
		expect(cell.tabIndex).toBe(0);
		fireEvent.focus(cell);
		const header = screen.getByRole("columnheader", { name: /Symbol/ });
		fireEvent.keyDown(header, { key: "Enter" });
		expect(rowTexts()).toEqual(["BTC", "ETH", "SOL"]);
		expect(onRowAction).not.toHaveBeenCalled();
	});
	it("reports the absolute row index and total count across pages", () => {
		const many = Array.from({ length: 30 }, (_, i) => ({
			id: String(i),
			symbol: `S${i}`,
			price: i,
			change: 0,
		}));
		render(
			<DataGrid
				aria-label="Grid"
				columns={columns}
				data={many}
				getRowId={(r) => r.id}
				pagination={{ pageSize: 10 }}
			/>,
		);
		expect(screen.getByRole("grid").getAttribute("aria-rowcount")).toBe("31");
		fireEvent.click(screen.getByRole("button", { name: /next/i }));
		const rows = screen.getAllByRole("row").slice(1);
		expect(rows[0]?.getAttribute("aria-rowindex")).toBe("12");
	});
	it("constrains the scroll area to `height` and virtualizes rows", () => {
		const many = Array.from({ length: 1000 }, (_, i) => ({
			id: String(i),
			symbol: `S${i}`,
			price: i,
			change: 0,
		}));
		const { container } = render(
			<DataGrid
				aria-label="Grid"
				columns={columns}
				data={many}
				getRowId={(r) => r.id}
				virtualize
				height={300}
			/>,
		);
		const scroller = container.querySelector<HTMLElement>(".nq-datagrid > .overflow-auto");
		expect(scroller?.style.height).toBe("300px");
		expect(scroller?.style.flex).toBe("0 1 auto");
		// happy-dom reports a zero-size scroll element, so only the overscan window is rendered.
		expect(screen.getAllByRole("row").length - 1).toBeLessThan(100);
	});
	it("shows the placeholder for non-finite numbers", () => {
		const { container } = render(
			<div>{formatCellValue(Number.NaN, columns[1] as DataGridColumn<Row>)}</div>,
		);
		expect(container.textContent).toBe("–");
	});
	it("colors a delta neutral when it rounds to zero", () => {
		const { container } = render(
			<div>{formatCellValue(0.00001, columns[2] as DataGridColumn<Row>)}</div>,
		);
		expect(container.querySelector(".text-muted")).toBeTruthy();
		expect(container.querySelector(".text-up-text")).toBeNull();
	});
	it("formats cell values by column format", () => {
		const { container } = render(
			<div>{formatCellValue(-0.0087, columns[2] as DataGridColumn<Row>)}</div>,
		);
		expect(container.textContent).toBe("-0.87%");
		expect(container.querySelector(".text-down-text")).toBeTruthy();
	});
});
