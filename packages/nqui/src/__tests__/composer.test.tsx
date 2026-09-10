import { act, fireEvent, render, screen } from "@testing-library/react";
import type { Editor } from "@tiptap/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { Composer } from "../editor/composer";
import { Markdown } from "../markdown/markdown";

function mount(props: Partial<ComponentProps<typeof Composer>> = {}) {
	let editor!: Editor;
	render(
		<Composer
			{...props}
			onReady={(e) => {
				editor = e;
			}}
		/>,
	);
	return { editor, input: screen.getByRole("textbox", { name: "Message" }) };
}

describe("Composer", () => {
	it("starts a new paragraph on Enter and submits Markdown on Cmd+Enter, then clears", async () => {
		const onSubmit = vi.fn();
		const { editor, input } = mount({ onSubmit, attachments: false });
		act(() => editor.commands.setContent("**hello**", { contentType: "markdown" }));
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSubmit).not.toHaveBeenCalled();
		expect(editor.getHTML()).toBe("<p><strong>hello</strong></p><p></p>");
		act(() => editor.commands.setContent("**hello**", { contentType: "markdown" }));
		fireEvent.keyDown(input, { key: "Enter", metaKey: true });
		expect(onSubmit).toHaveBeenCalledWith({
			value: "**hello**",
			html: "<p><strong>hello</strong></p>",
			files: [],
		});
		await vi.waitFor(() => expect(editor.isEmpty).toBe(true));
	});

	it("sends on plain Enter only with submitOnEnter", () => {
		const onSubmit = vi.fn();
		const { editor, input } = mount({ onSubmit, submitOnEnter: true });
		act(() => editor.commands.setContent("hi", { contentType: "markdown" }));
		fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
		expect(onSubmit).not.toHaveBeenCalled();
		expect(editor.getHTML()).toContain("<br>");
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSubmit).toHaveBeenCalledOnce();
	});

	it("disables the send button while the text is empty", () => {
		const { editor } = mount();
		const send = screen.getByRole("button", { name: "Send" });
		expect(send.hasAttribute("disabled")).toBe(true);
		act(() => editor.commands.setContent("x", { contentType: "markdown" }));
		expect(send.hasAttribute("disabled")).toBe(false);
	});

	it("exposes formatting buttons that change the document", () => {
		const onChange = vi.fn();
		const { editor } = mount({ defaultValue: "Body", onChange, autoFocus: true });
		const labels = Array.from(screen.getByRole("toolbar").querySelectorAll("button")).map((b) =>
			b.getAttribute("aria-label"),
		);
		expect(labels).toEqual([
			"Attach image",
			"Undo",
			"Redo",
			"Bold",
			"Italic",
			"Underline",
			"Heading 1",
			"Heading 2",
			"Paragraph",
			"Send",
		]);
		fireEvent.click(screen.getByRole("button", { name: "Heading 2" }));
		expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Body");
		expect(onChange).toHaveBeenLastCalledWith("## Body");
		expect(screen.getByRole("button", { name: "Undo" }).hasAttribute("disabled")).toBe(false);
		fireEvent.click(screen.getByRole("button", { name: "Paragraph" }));
		expect(screen.queryByRole("heading")).toBeNull();
		act(() => editor.commands.selectAll());
		fireEvent.click(screen.getByRole("button", { name: "Bold" }));
		expect(onChange).toHaveBeenLastCalledWith("**Body**");
	});

	it("toggles a Markdown preview of the draft", () => {
		mount({
			renderPreview: (text) => <Markdown>{text}</Markdown>,
			defaultValue: "**bold** and `code`",
		});
		fireEvent.click(screen.getByRole("button", { name: "Preview Markdown" }));
		const preview = screen.getByTestId("composer-preview");
		expect(preview.querySelector("strong")?.textContent).toBe("bold");
		expect(screen.getByRole("button", { name: "Bold" }).hasAttribute("disabled")).toBe(true);
	});

	it("lists attached files with a remove control", () => {
		const onFilesChange = vi.fn();
		const file = new File(["x"], "chart.png", { type: "image/png" });
		Object.assign(URL, { createObjectURL: () => "blob:chart", revokeObjectURL: () => {} });
		mount({ defaultFiles: [file], onFilesChange });
		expect(screen.getByRole("img", { name: "chart.png" })).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Remove chart.png" }));
		expect(onFilesChange).toHaveBeenCalledWith([]);
	});
});

describe("Markdown", () => {
	it("renders GitHub-flavored structure", () => {
		render(
			<Markdown>
				{"# Title\n\n- [x] one\n- two\n\n```sql\nSELECT 1\n```\n\n| a | b |\n| - | - |\n| 1 | 2 |"}
			</Markdown>,
		);
		expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Title");
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
		expect(screen.getByRole("checkbox")).toBeTruthy();
		expect(screen.getByText("SELECT 1").closest("pre")).toBeTruthy();
		expect(screen.getByRole("table")).toBeTruthy();
	});

	it("drops raw HTML and unsafe link targets", () => {
		const { container } = render(
			<Markdown>{"[ok](https://x.dev) [bad](javascript:alert) <b>raw</b>"}</Markdown>,
		);
		expect(screen.getByRole("link", { name: "ok" }).getAttribute("href")).toBe("https://x.dev");
		expect(screen.getByRole("link", { name: "bad" }).getAttribute("href")).toBeNull();
		expect(container.querySelector("b")).toBeNull();
	});
});
