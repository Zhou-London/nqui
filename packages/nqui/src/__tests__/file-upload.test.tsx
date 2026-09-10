import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { FileUpload, partitionFiles, UploadButton } from "../components/file-upload";

const csv = (name: string, bytes = 3) => new File(["x".repeat(bytes)], name, { type: "text/csv" });

it("partitions a selection by type, size, and count", () => {
	const result = partitionFiles(
		[csv("a.csv"), csv("b.csv", 9), new File([""], "c.pdf"), csv("d.csv"), csv("e.csv")],
		{ accept: [".csv"], multiple: true, maxSize: 4, maxFiles: 3 },
		1,
	);
	expect(result.accepted.map((f) => f.name)).toEqual(["a.csv", "d.csv"]);
	expect(result.rejected.map((r) => `${r.file.name}:${r.reason}`)).toEqual([
		"b.csv:size",
		"c.pdf:type",
		"e.csv:count",
	]);
});
it("hands accepted files to the caller and reports the rest inline", () => {
	const onSelect = vi.fn();
	const { container } = render(<FileUpload accept={[".csv"]} maxSize={4} onSelect={onSelect} />);
	const input = container.querySelector("input[type=file]") as HTMLInputElement;
	fireEvent.change(input, { target: { files: [csv("large.csv", 9)] } });
	expect(onSelect).not.toHaveBeenCalled();
	expect(screen.getByRole("alert").textContent).toContain("large.csv");
	const valid = csv("rows.csv");
	fireEvent.change(input, { target: { files: [valid] } });
	expect(onSelect).toHaveBeenCalledWith([valid]);
	expect(screen.queryByRole("alert")).toBeNull();
});
it("lists files with the caller's upload state", () => {
	const onRemove = vi.fn();
	render(
		<FileUpload
			onSelect={() => {}}
			onRemove={onRemove}
			files={[
				{ id: "1", name: "a.csv", size: 2048, status: "uploading", progress: 40 },
				{ id: "2", name: "b.csv", status: "error", error: "Rejected by server" },
			]}
		/>,
	);
	expect(screen.getByRole("progressbar", { name: "a.csv upload progress" })).toBeTruthy();
	expect(screen.getByText("Rejected by server")).toBeTruthy();
	fireEvent.click(screen.getByRole("button", { name: "Remove b.csv" }));
	expect(onRemove).toHaveBeenCalledWith("2");
});
it("renders the upload button as a plain button with the same rules", () => {
	const onReject = vi.fn();
	const { container } = render(
		<UploadButton accept={["image/*"]} onSelect={() => {}} onReject={onReject}>
			Add image
		</UploadButton>,
	);
	expect(screen.getByRole("button", { name: "Add image" })).toBeTruthy();
	const input = container.querySelector("input[type=file]") as HTMLInputElement;
	expect(input.accept).toBe("image/*");
	fireEvent.change(input, { target: { files: [csv("a.csv")] } });
	expect(onReject).toHaveBeenCalledOnce();
});
