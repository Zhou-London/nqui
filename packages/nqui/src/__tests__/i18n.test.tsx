import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Pagination } from "../components/pagination";
import { toast } from "../components/toast";
import { enMessages, zhCNMessages } from "../i18n/messages";
import { NquiProvider } from "../providers/nqui-provider";

afterEach(() => {
	act(() => toast.clear());
});

const pager = <Pagination page={2} total={5} onChange={() => {}} />;

describe("messages", () => {
	it("defines every English key in the Chinese catalog", () => {
		expect(Object.keys(zhCNMessages).sort()).toEqual(Object.keys(enMessages).sort());
	});
	it("uses English by default", () => {
		render(<NquiProvider locale="en-US">{pager}</NquiProvider>);
		expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Next page" })).toBeTruthy();
	});
	it("follows a Chinese locale", () => {
		render(<NquiProvider locale="zh-CN">{pager}</NquiProvider>);
		expect(screen.getByRole("navigation", { name: "分页" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "第 3 页" })).toBeTruthy();
	});
	it("applies overrides, with inner providers merged over outer ones", () => {
		render(
			<NquiProvider locale="en-US" messages={{ pagination: "Pages" }}>
				<NquiProvider locale="en-US" messages={{ nextPage: "Forward" }}>
					{pager}
				</NquiProvider>
			</NquiProvider>,
		);
		expect(screen.getByRole("navigation", { name: "Pages" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Forward" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Previous page" })).toBeTruthy();
	});
});

describe("NquiProvider", () => {
	it("shows each toast once when providers are nested", () => {
		render(
			<NquiProvider>
				<NquiProvider>
					<div />
				</NquiProvider>
			</NquiProvider>,
		);
		act(() => {
			toast.success("Saved");
		});
		expect(screen.getAllByText("Saved")).toHaveLength(1);
	});
});
