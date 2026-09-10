import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Chat, ChatActions, ChatAvatar, ChatMessage } from "../components/chat";

describe("Chat", () => {
	it("renders a user bubble and an assistant message with its avatar", () => {
		render(
			<Chat>
				<ChatMessage from="user">Hello</ChatMessage>
				<ChatMessage avatar={<ChatAvatar>AI</ChatAvatar>} name="Assistant">
					Hi there
				</ChatMessage>
			</Chat>,
		);
		expect(screen.getByRole("log")).toBeTruthy();
		expect(screen.getByText("Hello").className).toContain("bg-surface-2");
		expect(screen.getByText("Assistant")).toBeTruthy();
		expect(screen.getByText("Hi there")).toBeTruthy();
	});

	it("copies the message text", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
		const onCopy = vi.fn();
		render(<ChatActions copyText="answer" onCopy={onCopy} />);
		fireEvent.click(screen.getByRole("button", { name: "Copy" }));
		await screen.findByRole("button", { name: "Copied" });
		expect(writeText).toHaveBeenCalledWith("answer");
		expect(onCopy).toHaveBeenCalledOnce();
	});

	it("toggles a rating and clears it on a second press", () => {
		const onFeedbackChange = vi.fn();
		render(<ChatActions onFeedbackChange={onFeedbackChange} />);
		const up = screen.getByRole("button", { name: "Good response" });
		fireEvent.click(up);
		expect(onFeedbackChange).toHaveBeenLastCalledWith("up");
		expect(up.getAttribute("aria-pressed")).toBe("true");
		fireEvent.click(up);
		expect(onFeedbackChange).toHaveBeenLastCalledWith(null);
		expect(up.getAttribute("aria-pressed")).toBe("false");
	});

	it("hides actions that have no handler", () => {
		const onRegenerate = vi.fn();
		render(<ChatActions onRegenerate={onRegenerate} />);
		expect(screen.queryByRole("button", { name: "Copy" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Good response" })).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Regenerate" }));
		expect(onRegenerate).toHaveBeenCalledOnce();
	});
});
