import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderBook } from "../finance/order-book";

describe("OrderBook", () => {
	it("sorts each side best-first and merges duplicate prices", () => {
		render(
			<OrderBook
				bids={[
					[99, 1],
					[100, 2],
					[100, 3],
				]}
				asks={[
					[102, 1],
					[101, 4],
				]}
				showTotal={false}
				priceDecimals={0}
				sizeDecimals={0}
			/>,
		);
		const rows = screen.getAllByRole("button").map((b) => b.textContent);
		// Stacked layout renders asks in a reversed column, then bids.
		expect(rows).toEqual(["1014", "1021", "1005", "991"]);
	});
});
