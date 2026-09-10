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
	// The toolbar's filter chips are a TagGroup, which is also a grid of rows.
	const grid = screen.getAllByRole("grid").find((g) => g.hasAttribute("aria-rowcount"));
	if (!grid) throw new Error("no data grid rendered");
	return within(grid)
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

it("notifies controlled selection before the parent updates, without echoing prop changes", () => {
	const onSelectionChange = vi.fn();
	const { rerender } = render(
		<DataGrid
			columns={columns}
			data={data}
			getRowId={(r) => r.id}
			selectionMode="single"
			selectedRowIds={{}}
			onSelectionChange={onSelectionChange}
		/>,
	);
	fireEvent.click(screen.getAllByRole("gridcell")[0] as HTMLElement);
	expect(onSelectionChange).toHaveBeenCalledWith({ a: true }, [data[0]]);
	rerender(
		<DataGrid
			columns={columns}
			data={data}
			getRowId={(r) => r.id}
			selectionMode="single"
			selectedRowIds={{ a: true }}
			onSelectionChange={onSelectionChange}
		/>,
	);
	expect(onSelectionChange).toHaveBeenCalledTimes(1);
});
it("renders invalid dates as placeholders", () => {
	const { container } = render(
		<DataGrid
			columns={[{ accessorKey: "date", format: "datetime" }]}
			data={[{ date: "bad-date" }, { date: new Date(Number.NaN) }]}
		/>,
	);
	expect(container.textContent).toContain("–");
	expect(screen.getAllByRole("gridcell").map((c) => c.textContent)).toEqual(["–", "–"]);
});
it("renders server pages without paginating or filtering them again", () => {
	const change = vi.fn();
	render(
		<DataGrid
			columns={columns}
			data={data}
			getRowId={(r) => r.id}
			pagination
			manualPagination
			manualFiltering
			rowCount={90}
			paginationState={{ pageIndex: 4, pageSize: 3 }}
			onPaginationChange={change}
			globalFilter="missing"
		/>,
	);
	expect(rowTexts()).toEqual(["ETH", "BTC", "SOL"]);
	expect(screen.getByRole("grid").getAttribute("aria-rowcount")).toBe("91");
	fireEvent.click(screen.getByRole("button", { name: "Next page" }));
	expect(change).toHaveBeenCalledWith({ pageIndex: 5, pageSize: 3 });
});
it("preserves off-page selection when selecting a server page", () => {
	const change = vi.fn();
	render(
		<DataGrid
			columns={columns}
			data={data}
			getRowId={(r) => r.id}
			selectionMode="multiple"
			selectedRowIds={{ elsewhere: true }}
			onSelectionChange={change}
			pagination
			manualPagination
			rowCount={90}
		/>,
	);
	fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }));
	expect(change).toHaveBeenCalledWith({ elsewhere: true, a: true, b: true, c: true }, data);
});
it("applies column filters from the toolbar panel and clears them from the chips", () => {
	const change = vi.fn();
	render(
		<DataGrid
			columns={columns}
			data={data}
			getRowId={(r) => r.id}
			toolbar
			defaultColumnFilters={[{ id: "price", value: [1000, null] }]}
			onColumnFiltersChange={change}
		/>,
	);
	expect(rowTexts()).toEqual(["ETH", "BTC"]);
	const chip = screen.getByRole("row", { name: "Price: ≥ 1,000" });
	expect(chip.textContent).toContain("≥ 1,000");
	fireEvent.click(within(chip).getByRole("button", { name: /^Remove/ }));
	expect(change).toHaveBeenLastCalledWith([]);
	expect(rowTexts()).toEqual(["ETH", "BTC", "SOL"]);
});
it("supports text and select filters together", () => {
	render(
		<DataGrid
			columns={[
				...columns,
				{ accessorKey: "symbol", id: "pick", header: "Pick", filter: "select" },
			]}
			data={data}
			getRowId={(r) => r.id}
			toolbar
			columnFilters={[
				{ id: "symbol", value: "t" },
				{ id: "pick", value: ["ETH", "SOL"] },
			]}
		/>,
	);
	expect(rowTexts()).toEqual(["ETH"]);
	expect(screen.getByText("1 of 3 rows")).toBeTruthy();
});
