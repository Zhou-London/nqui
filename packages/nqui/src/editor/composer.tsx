import { Markdown as MarkdownExtension } from "@tiptap/markdown";
import { type Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	ArrowUp,
	Bold,
	Eye,
	Heading1,
	Heading2,
	ImagePlus,
	Italic,
	Pilcrow,
	Redo2,
	Underline,
	Undo2,
	X,
} from "lucide-react";
import { type ComponentProps, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { FileTrigger } from "react-aria-components";
import { Button, IconButton } from "../components/button";
import { Divider } from "../components/divider";
import { type FileRejection, type FileRules, partitionFiles } from "../components/file-upload";
import { Spinner } from "../components/spinner";
import { ToggleButton } from "../components/toggle-button";
import { Tooltip, TooltipTrigger } from "../components/tooltip";
import { cn } from "../utils/cn";

export interface ComposerSubmit {
	/** The document as Markdown. Underline serializes as `++text++`. */
	value: string;
	html: string;
	files: File[];
}

export interface ComposerProps
	extends Omit<ComponentProps<"div">, "onChange" | "onSubmit" | "defaultValue">,
		FileRules {
	/** Markdown. Controlled when set; the editor re-parses it whenever it changes. */
	value?: string;
	defaultValue?: string;
	onChange?: (markdown: string) => void;
	placeholder?: string;
	/** Called with Markdown, HTML, and files; unchanged uncontrolled drafts clear on success. */
	onSubmit?: (submission: ComposerSubmit) => void | Promise<void>;
	/** Shows a spinner in the send button and blocks further submits. */
	isSubmitting?: boolean;
	isDisabled?: boolean;
	/**
	 * Make Enter send instead of starting a new paragraph. Cmd/Ctrl+Enter always sends, and
	 * Shift+Enter always inserts a line break.
	 */
	submitOnEnter?: boolean;
	minRows?: number;
	maxRows?: number;
	/** Text size; `md` is 16 px, `sm` is 14 px. */
	size?: "sm" | "md";
	/** Undo / redo, bold / italic / underline, and heading / paragraph buttons. */
	formatting?: boolean;
	/**
	 * Adds a Write / Preview toggle that renders the Markdown, for example with `Markdown`
	 * from `@nowquant/nqui/markdown`: `renderPreview={(text) => <Markdown>{text}</Markdown>}`.
	 */
	renderPreview?: (markdown: string) => ReactNode;
	/** Shows the attach button. Defaults to image files; set `accept` for others. */
	attachments?: boolean;
	files?: File[];
	defaultFiles?: File[];
	onFilesChange?: (files: File[]) => void;
	onReject?: (rejections: FileRejection[]) => void;
	/** Extra controls at the start of the toolbar, after the built-in ones. */
	toolbarStart?: ReactNode;
	/** Extra controls before the send button. */
	toolbarEnd?: ReactNode;
	/** Accessible name of the send button. */
	submitLabel?: string;
	autoFocus?: boolean;
	"aria-label"?: string;
	/** Access the Tiptap instance, for example to insert text from outside. */
	onReady?: (editor: Editor) => void;
}

const extensions = [
	StarterKit.configure({
		heading: { levels: [1, 2] },
		// Only what the toolbar exposes.
		link: false,
		code: false,
		codeBlock: false,
		blockquote: false,
		horizontalRule: false,
		strike: false,
		bulletList: false,
		orderedList: false,
		listItem: false,
		trailingNode: false,
	}),
	MarkdownExtension,
];

// Typography for the ProseMirror document, kept on the seven-step type scale.
const contentClass = [
	"[&_.ProseMirror]:min-h-[inherit] [&_.ProseMirror]:outline-hidden [&_.ProseMirror]:wrap-break-word",
	"[&_.ProseMirror]:flex [&_.ProseMirror]:flex-col [&_.ProseMirror]:gap-2",
	"[&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:tracking-tight",
	"[&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:tracking-tight",
	"[&_.ProseMirror_u]:underline-offset-4",
].join(" ");

const emptyEditorState = {
	isEmpty: true,
	canUndo: false,
	canRedo: false,
	bold: false,
	italic: false,
	underline: false,
	h1: false,
	h2: false,
	paragraph: false,
};

/**
 * Prompt editor for chat and comment boxes: a toolbar on top with formatting, attachment,
 * and send controls, a rich text area on Tiptap underneath, and attachment thumbnails.
 * The document round-trips as Markdown, so `onSubmit` hands the app plain text.
 */
export function Composer({
	value: valueProp,
	defaultValue = "",
	onChange,
	placeholder = "Write a message…",
	onSubmit,
	isSubmitting = false,
	isDisabled = false,
	submitOnEnter = false,
	minRows = 3,
	maxRows = 12,
	size = "md",
	formatting = true,
	renderPreview,
	attachments = true,
	accept = ["image/*"],
	multiple = true,
	maxSize,
	maxFiles,
	files: filesProp,
	defaultFiles = [],
	onFilesChange,
	onReject,
	toolbarStart,
	toolbarEnd,
	submitLabel = "Send",
	autoFocus,
	"aria-label": ariaLabel = "Message",
	onReady,
	className,
	...props
}: ComposerProps) {
	const [innerFiles, setInnerFiles] = useState<File[]>(defaultFiles);
	const files = filesProp ?? innerFiles;
	const [preview, setPreview] = useState(false);
	// ProseMirror keeps the first `handleKeyDown`; the ref lets it reach the current submit.
	const submitRef = useRef<() => Promise<void>>(async () => {});

	const editor = useEditor({
		immediatelyRender: false,
		extensions,
		content: valueProp ?? defaultValue,
		contentType: "markdown",
		editable: !isDisabled,
		autofocus: autoFocus ? "end" : false,
		editorProps: {
			attributes: { "aria-label": ariaLabel, role: "textbox", "aria-multiline": "true" },
			handleKeyDown: (_view, event) => {
				if (event.key !== "Enter" || event.isComposing) return false;
				const forced = event.metaKey || event.ctrlKey;
				if (forced || (submitOnEnter && !event.shiftKey)) {
					void submitRef.current();
					return true;
				}
				return false;
			},
		},
		onUpdate: ({ editor }) => onChange?.(editor.getMarkdown()),
	});
	useEffect(() => {
		// Silent: an editable switch is not a content change.
		editor?.setEditable(!isDisabled, false);
	}, [editor, isDisabled]);
	useEffect(() => {
		if (editor && valueProp !== undefined && valueProp !== editor.getMarkdown())
			editor.commands.setContent(valueProp, { contentType: "markdown", emitUpdate: false });
	}, [editor, valueProp]);
	useEffect(() => {
		if (editor) onReady?.(editor);
	}, [editor, onReady]);
	const state =
		useEditorState({
			editor,
			selector: () => ({
				isEmpty: editor?.isEmpty ?? true,
				canUndo: editor?.can().undo() ?? false,
				canRedo: editor?.can().redo() ?? false,
				bold: editor?.isActive("bold") ?? false,
				italic: editor?.isActive("italic") ?? false,
				underline: editor?.isActive("underline") ?? false,
				h1: editor?.isActive("heading", { level: 1 }) ?? false,
				h2: editor?.isActive("heading", { level: 2 }) ?? false,
				paragraph: editor?.isActive("paragraph") ?? false,
			}),
		}) ?? emptyEditorState;

	const setFiles = (next: File[]) => {
		setInnerFiles(next);
		onFilesChange?.(next);
	};
	const canSubmit =
		!!editor && !isDisabled && !isSubmitting && (!state.isEmpty || files.length > 0);
	const submit = async () => {
		if (!editor || (editor.isEmpty && files.length === 0)) return;
		if (isDisabled || isSubmitting) return;
		const submittedDocument = editor.state.doc;
		await onSubmit?.({ value: editor.getMarkdown(), html: editor.getHTML(), files });
		// ProseMirror documents are immutable; a new reference means the draft was edited.
		if (!editor.isDestroyed && valueProp === undefined && editor.state.doc === submittedDocument)
			editor.commands.clearContent(true);
		if (filesProp === undefined) setInnerFiles((current) => (current === files ? [] : current));
	};
	submitRef.current = submit;
	const addFiles = (list: FileList | null) => {
		const { accepted, rejected } = partitionFiles(list ?? [], {
			accept,
			multiple,
			maxSize,
			maxFiles: maxFiles === undefined ? undefined : Math.max(0, maxFiles - files.length),
		});
		if (rejected.length) onReject?.(rejected);
		if (accepted.length) setFiles(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
	};

	const lineHeight = size === "sm" ? 1.25 : 1.5;
	const rowsStyle = {
		minHeight: `${minRows * lineHeight}rem`,
		maxHeight: `${maxRows * lineHeight}rem`,
	};
	const run = () => editor?.chain().focus();
	// A reply box with every control off keeps the send button beside the text instead of
	// on an otherwise empty toolbar row above it.
	const hasToolbar = attachments || !!renderPreview || formatting || !!toolbarStart || !!toolbarEnd;
	const submitButton = (
		<Button
			aria-label={submitLabel}
			color="primary"
			size="sm"
			isIconOnly
			isDisabled={!canSubmit}
			onPress={() => void submit()}
		>
			{isSubmitting ? <Spinner size="xs" color="current" /> : <ArrowUp />}
		</Button>
	);

	return (
		<div
			{...props}
			data-disabled={isDisabled || undefined}
			className={cn(
				"group/composer flex flex-col gap-2 rounded-3xl border border-border bg-surface p-4 shadow-md",
				"transition-[border-color,box-shadow] focus-within:border-border-strong",
				"data-disabled:opacity-60",
				size === "sm" ? "text-sm" : "text-base",
				className,
			)}
		>
			{hasToolbar ? (
				<div role="toolbar" aria-label="Composer" className="flex flex-wrap items-center gap-2">
					{attachments ? (
						<FileTrigger acceptedFileTypes={accept} allowsMultiple={multiple} onSelect={addFiles}>
							<ToolbarButton label="Attach image" icon={<ImagePlus />} isDisabled={isDisabled} />
						</FileTrigger>
					) : null}
					{renderPreview ? (
						<ToolbarToggle
							label={preview ? "Back to editing" : "Preview Markdown"}
							icon={<Eye />}
							isSelected={preview}
							isDisabled={isDisabled}
							onChange={setPreview}
							className="bg-surface-2 text-foreground"
						/>
					) : null}
					{formatting ? (
						<>
							{attachments || renderPreview ? <ToolbarDivider /> : null}
							<ToolbarButton
								label="Undo"
								icon={<Undo2 />}
								isDisabled={isDisabled || preview || !state.canUndo}
								onPress={() => run()?.undo().run()}
							/>
							<ToolbarButton
								label="Redo"
								icon={<Redo2 />}
								isDisabled={isDisabled || preview || !state.canRedo}
								onPress={() => run()?.redo().run()}
							/>
							<ToolbarDivider />
							<ToolbarToggle
								label="Bold"
								icon={<Bold />}
								isSelected={state.bold}
								isDisabled={isDisabled || preview}
								onChange={() => run()?.toggleBold().run()}
							/>
							<ToolbarToggle
								label="Italic"
								icon={<Italic />}
								isSelected={state.italic}
								isDisabled={isDisabled || preview}
								onChange={() => run()?.toggleItalic().run()}
							/>
							<ToolbarToggle
								label="Underline"
								icon={<Underline />}
								isSelected={state.underline}
								isDisabled={isDisabled || preview}
								onChange={() => run()?.toggleUnderline().run()}
							/>
							<ToolbarDivider />
							<ToolbarToggle
								label="Heading 1"
								icon={<Heading1 />}
								isSelected={state.h1}
								isDisabled={isDisabled || preview}
								onChange={() => run()?.toggleHeading({ level: 1 }).run()}
							/>
							<ToolbarToggle
								label="Heading 2"
								icon={<Heading2 />}
								isSelected={state.h2}
								isDisabled={isDisabled || preview}
								onChange={() => run()?.toggleHeading({ level: 2 }).run()}
							/>
							<ToolbarToggle
								label="Paragraph"
								icon={<Pilcrow />}
								isSelected={state.paragraph}
								isDisabled={isDisabled || preview}
								onChange={() => run()?.setParagraph().run()}
							/>
						</>
					) : null}
					{toolbarStart}
					<div className="ml-auto flex items-center gap-2">
						{toolbarEnd}
						{submitButton}
					</div>
				</div>
			) : null}
			{preview ? (
				<div
					className="overflow-y-auto py-2 text-foreground"
					style={rowsStyle}
					data-testid="composer-preview"
				>
					{state.isEmpty ? (
						<span className="text-subtle">Nothing to preview.</span>
					) : (
						renderPreview?.(editor?.getMarkdown() ?? "")
					)}
				</div>
			) : null}
			<div hidden={preview} className="flex items-end gap-2">
				<div
					className="relative min-w-0 flex-1 overflow-y-auto py-2 text-foreground"
					style={rowsStyle}
				>
					{state.isEmpty ? (
						<span aria-hidden className="pointer-events-none absolute text-subtle">
							{placeholder}
						</span>
					) : null}
					<EditorContent editor={editor} className={contentClass} />
				</div>
				{hasToolbar ? null : submitButton}
			</div>
			{files.length ? (
				<ComposerAttachments
					files={files}
					isDisabled={isDisabled}
					onRemove={(index) => setFiles(files.filter((_, i) => i !== index))}
				/>
			) : null}
		</div>
	);
}

function ToolbarDivider() {
	return <Divider orientation="vertical" className="h-6" />;
}

interface ToolbarButtonProps {
	label: string;
	icon: ReactNode;
	isDisabled?: boolean;
	onPress?: () => void;
}

function ToolbarButton({ label, icon, isDisabled, onPress }: ToolbarButtonProps) {
	return (
		<TooltipTrigger>
			<IconButton
				aria-label={label}
				variant="soft"
				color="neutral"
				size="sm"
				isDisabled={isDisabled}
				onPress={onPress}
				className="bg-surface-2 text-foreground"
			>
				{icon}
			</IconButton>
			<Tooltip>{label}</Tooltip>
		</TooltipTrigger>
	);
}

interface ToolbarToggleProps {
	label: string;
	icon: ReactNode;
	isSelected: boolean;
	isDisabled?: boolean;
	onChange: (selected: boolean) => void;
	className?: string;
}

function ToolbarToggle({
	label,
	icon,
	isSelected,
	isDisabled,
	onChange,
	className,
}: ToolbarToggleProps) {
	return (
		<TooltipTrigger>
			<ToggleButton
				aria-label={label}
				variant="soft"
				color="primary"
				size="sm"
				radius="full"
				isIconOnly
				isSelected={isSelected}
				isDisabled={isDisabled}
				onChange={onChange}
				className={className}
			>
				{icon}
			</ToggleButton>
			<Tooltip>{label}</Tooltip>
		</TooltipTrigger>
	);
}

interface ComposerAttachmentsProps {
	files: File[];
	isDisabled?: boolean;
	onRemove: (index: number) => void;
}

function ComposerAttachments({ files, isDisabled, onRemove }: ComposerAttachmentsProps) {
	const urls = useMemo(
		() => files.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : null)),
		[files],
	);
	useEffect(
		() => () => {
			for (const url of urls) if (url) URL.revokeObjectURL(url);
		},
		[urls],
	);
	return (
		<ul className="flex flex-wrap gap-2" aria-label="Attachments">
			{files.map((file, i) => (
				<li
					key={`${file.name}-${file.size}-${file.lastModified}`}
					className="group/thumb relative size-16 overflow-hidden rounded-lg border border-border bg-surface-2"
				>
					{urls[i] ? (
						<img src={urls[i] as string} alt={file.name} className="size-full object-cover" />
					) : (
						<span className="flex size-full items-center justify-center px-1 text-center text-muted text-xs">
							{file.name}
						</span>
					)}
					<IconButton
						aria-label={`Remove ${file.name}`}
						size="xs"
						variant="solid"
						color="accent"
						isDisabled={isDisabled}
						onPress={() => onRemove(i)}
						className="absolute top-1 right-1 size-5 opacity-0 focus-visible:opacity-100 group-hover/thumb:opacity-100 max-lg:opacity-100"
					>
						<X />
					</IconButton>
				</li>
			))}
		</ul>
	);
}
