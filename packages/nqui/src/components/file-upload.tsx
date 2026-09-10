import { Check, CircleAlert, CloudUpload, FileText, Upload, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { DropZone, FileTrigger, Text } from "react-aria-components";
import { cn } from "../utils/cn";
import { formatBytes } from "../utils/format";
import { Button, type ButtonProps, IconButton } from "./button";
import { ProgressBar } from "./progress";

export interface FileRejection {
	file: File;
	reason: "type" | "size" | "count";
}

export interface FileRules {
	/** Extensions (`.csv`), MIME types (`text/csv`), or wildcards (`image/*`). */
	accept?: string[];
	multiple?: boolean;
	/** Largest file in bytes. */
	maxSize?: number;
	/** Upper bound for the list, counting files already shown. */
	maxFiles?: number;
}

export interface FileUploadItem {
	id: string;
	name: string;
	size?: number;
	status?: "queued" | "uploading" | "done" | "error";
	/** 0–100 while uploading. */
	progress?: number;
	error?: string;
}

function matchesAccept(file: File, accept: string[]): boolean {
	if (accept.length === 0) return true;
	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();
	return accept.some((raw) => {
		const rule = raw.trim().toLowerCase();
		if (!rule) return false;
		if (rule.startsWith(".")) return name.endsWith(rule);
		if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
		return type === rule;
	});
}

/** Split a selection into files that pass the rules and files that do not. */
export function partitionFiles(
	files: Iterable<File>,
	rules: FileRules,
	existingCount = 0,
): { accepted: File[]; rejected: FileRejection[] } {
	const accepted: File[] = [];
	const rejected: FileRejection[] = [];
	const limit = rules.multiple ? (rules.maxFiles ?? Number.POSITIVE_INFINITY) : 1;
	let room = Math.max(0, limit - (rules.multiple ? existingCount : 0));
	for (const file of files) {
		if (!matchesAccept(file, rules.accept ?? [])) rejected.push({ file, reason: "type" });
		else if (rules.maxSize !== undefined && file.size > rules.maxSize)
			rejected.push({ file, reason: "size" });
		else if (room <= 0) rejected.push({ file, reason: "count" });
		else {
			accepted.push(file);
			room -= 1;
		}
	}
	return { accepted, rejected };
}

function rejectionText({ file, reason }: FileRejection, rules: FileRules): string {
	if (reason === "type") return `${file.name}: unsupported type`;
	if (reason === "size") return `${file.name}: larger than ${formatBytes(rules.maxSize ?? 0, 0)}`;
	return `${file.name}: too many files`;
}

function acceptLabel(accept: string[]): string {
	const names = accept.map((rule) => {
		const r = rule.trim();
		if (r.startsWith(".")) return r.slice(1).toUpperCase();
		if (r.endsWith("/*")) return r.charAt(0).toUpperCase() + r.slice(1, -2);
		return r.split("/").pop()?.toUpperCase() ?? r;
	});
	return [...new Set(names)].join(", ");
}

export interface FileUploadProps extends FileRules {
	label?: ReactNode;
	/** Replaces the generated hint about accepted types and size. */
	description?: ReactNode;
	buttonLabel?: ReactNode;
	isDisabled?: boolean;
	/** Files to list under the drop area, with the caller's upload state. */
	files?: FileUploadItem[];
	/** Called with the files that passed the rules. The caller performs the upload. */
	onSelect: (files: File[]) => void;
	onReject?: (rejections: FileRejection[]) => void;
	/** Shows a remove button on each listed file. */
	onRemove?: (id: string) => void;
	/** `sm` lays the drop area out as a single row. */
	size?: "sm" | "md";
	className?: string;
}

/**
 * Drop area with a browse button and a list of the files handed to the caller. Validation
 * happens here; uploading, progress, and errors are reported back through `files`.
 */
export function FileUpload({
	label = "Upload files",
	description,
	buttonLabel = "Browse files",
	accept,
	multiple,
	maxSize,
	maxFiles,
	isDisabled,
	files = [],
	onSelect,
	onReject,
	onRemove,
	size = "md",
	className,
}: FileUploadProps) {
	const rules: FileRules = { accept, multiple, maxSize, maxFiles };
	const [rejected, setRejected] = useState<FileRejection[]>([]);
	const receive = (incoming: Iterable<File>) => {
		if (isDisabled) return;
		const result = partitionFiles(incoming, rules, files.length);
		setRejected(result.rejected);
		if (result.rejected.length) onReject?.(result.rejected);
		if (result.accepted.length) onSelect(result.accepted);
	};
	const hint =
		description ??
		[
			accept?.length ? acceptLabel(accept) : "Any file type",
			maxSize ? `up to ${formatBytes(maxSize, 0)}` : null,
		]
			.filter(Boolean)
			.join(" · ");
	const row = size === "sm";

	return (
		<div className={cn("flex flex-col gap-4", className)}>
			<DropZone
				isDisabled={isDisabled}
				onDrop={async (e) => {
					const picked = await Promise.all(
						e.items.flatMap((item) => (item.kind === "file" ? [item.getFile()] : [])),
					);
					receive(picked);
				}}
				className={(rp) =>
					cn(
						"group flex rounded-xl border border-border bg-surface outline-hidden transition-[background-color,border-color,box-shadow] duration-150",
						row
							? "items-center gap-4 px-4 py-2"
							: "flex-col items-center gap-4 px-6 py-8 text-center",
						rp.isDropTarget && "border-primary bg-primary-soft",
						rp.isFocusVisible && "ring-2 ring-focus/70 ring-offset-2 ring-offset-background",
						rp.isDisabled && "opacity-50",
					)
				}
			>
				<span
					className={cn(
						"flex shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted transition-colors group-data-[drop-target]:bg-primary group-data-[drop-target]:text-primary-foreground",
						row ? "size-8 [&_svg]:size-4" : "size-12 [&_svg]:size-6",
					)}
				>
					<CloudUpload aria-hidden />
				</span>
				<div className={cn("flex min-w-0 flex-col gap-1", row && "flex-1")}>
					<Text slot="label" className="font-medium text-foreground text-sm">
						{label}
					</Text>
					<span className="text-muted text-xs">{hint}</span>
				</div>
				<FileTrigger
					acceptedFileTypes={accept}
					allowsMultiple={multiple}
					onSelect={(list) => receive(list ?? [])}
				>
					<Button
						size="sm"
						variant="outline"
						color="neutral"
						isDisabled={isDisabled}
						startContent={<Upload />}
						className={row ? "ml-auto" : "mt-1"}
					>
						{buttonLabel}
					</Button>
				</FileTrigger>
			</DropZone>
			{rejected.length ? (
				<p role="alert" className="flex items-start gap-1 text-error-text text-xs">
					<CircleAlert aria-hidden className="size-4 shrink-0" />
					<span>{rejected.map((r) => rejectionText(r, rules)).join("; ")}</span>
				</p>
			) : null}
			{files.length ? (
				<ul className="flex flex-col gap-2">
					{files.map((file) => (
						<FileRow key={file.id} file={file} onRemove={onRemove} />
					))}
				</ul>
			) : null}
		</div>
	);
}

function FileRow({ file, onRemove }: { file: FileUploadItem; onRemove?: (id: string) => void }) {
	const status = file.status ?? "queued";
	const meta = [
		file.size !== undefined ? formatBytes(file.size) : null,
		status === "uploading"
			? `Uploading${file.progress !== undefined ? ` · ${Math.round(file.progress)}%` : "…"}`
			: status === "done"
				? "Uploaded"
				: status === "error"
					? (file.error ?? "Upload failed")
					: null,
	]
		.filter(Boolean)
		.join(" · ");
	return (
		<li className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2">
			<span
				className={cn(
					"flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted [&_svg]:size-4",
					status === "error" && "bg-error-soft text-error-text",
				)}
			>
				<FileText aria-hidden />
			</span>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<span className="truncate font-medium text-foreground text-sm">{file.name}</span>
				<span
					className={cn("truncate text-xs", status === "error" ? "text-error-text" : "text-muted")}
				>
					{meta}
				</span>
				{status === "uploading" && file.progress !== undefined ? (
					<ProgressBar
						aria-label={`${file.name} upload progress`}
						size="sm"
						showValue={false}
						value={Math.max(0, Math.min(100, file.progress))}
						className="mt-1"
					/>
				) : null}
			</div>
			{status === "done" ? (
				<Check aria-label="Uploaded" className="size-4 shrink-0 text-success" />
			) : null}
			{onRemove ? (
				<IconButton
					aria-label={`Remove ${file.name}`}
					size="xs"
					variant="ghost"
					color="neutral"
					onPress={() => onRemove(file.id)}
				>
					<X />
				</IconButton>
			) : null}
		</li>
	);
}

export interface UploadButtonProps extends Omit<ButtonProps, "onPress" | "children">, FileRules {
	children?: ReactNode;
	onSelect: (files: File[]) => void;
	onReject?: (rejections: FileRejection[]) => void;
}

/** A button that opens the file picker and applies the same rules as `FileUpload`. */
export function UploadButton({
	accept,
	multiple,
	maxSize,
	maxFiles,
	onSelect,
	onReject,
	children = "Upload",
	startContent = <Upload />,
	...props
}: UploadButtonProps) {
	return (
		<FileTrigger
			acceptedFileTypes={accept}
			allowsMultiple={multiple}
			onSelect={(list) => {
				const { accepted, rejected } = partitionFiles(list ?? [], {
					accept,
					multiple,
					maxSize,
					maxFiles,
				});
				if (rejected.length) onReject?.(rejected);
				if (accepted.length) onSelect(accepted);
			}}
		>
			<Button {...props} startContent={startContent}>
				{children}
			</Button>
		</FileTrigger>
	);
}
