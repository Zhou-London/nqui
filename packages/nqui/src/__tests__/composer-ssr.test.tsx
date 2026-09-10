// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { Composer } from "../editor/composer";

it("renders the composer shell on the server without initializing the editor", () => {
	const onReady = vi.fn();
	const html = renderToString(<Composer defaultValue="Draft" onReady={onReady} />);
	expect(html).toContain('aria-label="Send"');
	expect(html).not.toContain('contenteditable="true"');
	expect(onReady).not.toHaveBeenCalled();
});
