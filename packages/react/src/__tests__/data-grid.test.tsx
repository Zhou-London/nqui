import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
	it("formats cell values by column format", () => {
		const { container } = render(
			<>{formatCellValue(-0.0087, columns[2] as DataGridColumn<Row>)}</>,
		);
		expect(container.textContent).toBe("-0.87%");
		expect(container.querySelector(".text-down-text")).toBeTruthy();
	});
});
