import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { type Candle, CandlestickChart } from "../charts/candlestick-chart";

const mocks = vi.hoisted(() => {
	const makeSeries = () => ({ setData: vi.fn(), update: vi.fn() });
	const makeChart = () => ({
		addSeries: vi.fn(makeSeries),
		priceScale: () => ({ applyOptions: vi.fn() }),
		timeScale: () => ({ fitContent: vi.fn() }),
		subscribeCrosshairMove: vi.fn(),
		unsubscribeCrosshairMove: vi.fn(),
		applyOptions: vi.fn(),
		remove: vi.fn(),
	});
	return {
		createChart: vi.fn(makeChart),
		theme: {
			muted: "transparent",
			text: "transparent",
			grid: "transparent",
			border: "transparent",
			up: "transparent",
			down: "transparent",
			fontFamily: "sans-serif",
		},
	};
});

vi.mock("lightweight-charts", () => ({
	createChart: mocks.createChart,
	CandlestickSeries: "candle",
	HistogramSeries: "volume",
	LineSeries: "line",
	ColorType: { Solid: "solid" },
	CrosshairMode: { Normal: 0 },
}));
vi.mock("../charts/theme", () => ({
	useChartTheme: () => mocks.theme,
	toRgba: (value: string) => value,
}));

const data: Candle[] = [{ time: 1700000000, open: 10, high: 12, low: 9, close: 11 }];

it.each([
	{ height: 400 },
	{ showVolume: false },
	{ priceFormat: { precision: 4, minMove: 0.0001 } },
])("populates the rebuilt chart after configuration changes: %j", (changed) => {
	const { rerender } = render(<CandlestickChart data={data} />);
	const original = mocks.createChart.mock.results.at(-1)?.value;
	rerender(<CandlestickChart data={data} {...changed} />);
	const chart = mocks.createChart.mock.results.at(-1)?.value;
	expect(original?.remove).toHaveBeenCalledOnce();
	expect(chart).not.toBe(original);
	expect(chart?.addSeries.mock.results[0]?.value.setData).toHaveBeenCalledWith(data);
});

it("uses incremental updates for live data without rebuilding the chart", () => {
	const { rerender } = render(<CandlestickChart data={data} />);
	const chart = mocks.createChart.mock.results.at(-1)?.value;
	const candle = { time: 1700000060, open: 11, high: 13, low: 10, close: 12 };
	rerender(<CandlestickChart data={[...data, candle]} />);
	expect(mocks.createChart.mock.results.at(-1)?.value).toBe(chart);
	expect(chart?.remove).not.toHaveBeenCalled();
	expect(chart?.addSeries.mock.results[0]?.value.setData).toHaveBeenCalledOnce();
	expect(chart?.addSeries.mock.results[0]?.value.update).toHaveBeenLastCalledWith(candle);
});
