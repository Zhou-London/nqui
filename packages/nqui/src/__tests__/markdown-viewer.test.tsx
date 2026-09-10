import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarkdownViewer } from "../markdown/markdown-viewer";

const doc =
	"# Getting started\n\nIntro.\n\n## Install it\n\n```bash\nnpm i x\n```\n\n| a |\n| - |\n| 1 |";

describe("MarkdownViewer", () => {
	it("lays the document out in flow with anchored headings", () => {
		const { container } = render(<MarkdownViewer>{doc}</MarkdownViewer>);
		const article = container.firstElementChild as HTMLElement;
		expect(article.tagName).toBe("ARTICLE");
		for (const cls of ["border", "shadow", "rounded", "overflow"])
			expect(article.className).not.toContain(cls);
		expect(screen.getByRole("heading", { level: 1 }).id).toBe("getting-started");
		expect(screen.getByRole("heading", { level: 2 }).id).toBe("install-it");
		expect(
			screen.getAllByRole("link", { name: "Link to this section" })[1]?.getAttribute("href"),
		).toBe("#install-it");
		expect(screen.getByRole("table")).toBeTruthy();
	});

	it("copies a code block", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
		render(<MarkdownViewer>{doc}</MarkdownViewer>);
		fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
		await screen.findByRole("button", { name: "Copied" });
		expect(writeText).toHaveBeenCalledWith("npm i x\n");
	});

	it("renders the empty slot for blank input", () => {
		render(<MarkdownViewer empty="Nothing here">{"  \n"}</MarkdownViewer>);
		expect(screen.getByText("Nothing here")).toBeTruthy();
	});
});
