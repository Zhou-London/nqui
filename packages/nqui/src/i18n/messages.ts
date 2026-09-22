/**
 * Every string NQUI renders on its own: labels for icon buttons, placeholders, empty states,
 * and status text. Consumers override any subset through `NquiProvider`'s `messages` prop,
 * or supply a whole catalog for a locale NQUI does not ship.
 */
export interface NquiMessages {
	// Shared
	close: string;
	dismiss: string;
	remove: string;
	/** Label for a button that removes one named item, e.g. an attached file. */
	removeItem: (name: string) => string;
	copy: string;
	copied: string;
	loading: string;
	searchPlaceholder: string;
	filterPlaceholder: string;
	noResults: string;
	noMatches: string;
	expand: string;
	collapse: string;
	total: string;

	// Pagination
	pagination: string;
	previousPage: string;
	nextPage: string;
	pageLabel: (page: number) => string;

	// Sidebar
	sidebar: string;
	showSidebar: string;
	hideSidebar: string;
	closeSidebar: string;
	resizeSidebar: string;

	// CommandPalette
	commandPalette: string;
	commandSearch: string;
	commandPlaceholder: string;
	commandNavigate: string;
	commandSelect: string;

	// Chat
	goodResponse: string;
	badResponse: string;
	regenerate: string;

	// FileUpload
	uploadFiles: string;
	browseFiles: string;
	upload: string;
	anyFileType: string;
	upToSize: (size: string) => string;
	uploading: (percent?: number) => string;
	uploaded: string;
	uploadFailed: string;
	uploadProgress: (name: string) => string;
	fileTypeRejected: (name: string) => string;
	fileSizeRejected: (name: string, maxSize: string) => string;
	fileCountRejected: (name: string) => string;

	// Table, DataGrid
	noRows: string;
	noRowsHint: string;
	searchRows: string;
	filter: string;
	filters: string;
	activeFilters: string;
	resetFilters: string;
	columns: string;
	containsPlaceholder: string;
	minPlaceholder: string;
	maxPlaceholder: string;
	minimumOf: (column: string) => string;
	maximumOf: (column: string) => string;
	yes: string;
	no: string;
	selectAll: string;
	selectRow: string;
	rowCount: (count: string, n: number) => string;
	rowsOfTotal: (shown: string, total: string) => string;
	selectedCount: (n: number) => string;
	pageOfTotal: (page: number, total: number) => string;
	rowsPerPage: string;
	perPage: (size: number) => string;

	// LogViewer
	searchLogs: string;
	follow: string;
	following: string;
	paused: string;
	noLogLines: string;

	// JsonViewer, SchemaTree, DataPreview
	copyJson: string;
	schema: string;
	previewSections: string;
	sample: string;
	column: string;
	type: string;
	nulls: string;
	distinct: string;
	distribution: string;
	mean: string;
	descriptionHeader: string;
	rows: string;
	nullCells: string;
	size: string;

	// MarkdownViewer
	linkToSection: string;
	copyCode: string;

	// QueryWorkbench
	queryFailed: string;
	results: string;
	running: string;
	noResultsYet: string;
	runQueryHint: string;

	// Composer
	composer: string;
	message: string;
	messagePlaceholder: string;
	send: string;
	attachImage: string;
	attachments: string;
	previewMarkdown: string;
	backToEditing: string;
	nothingToPreview: string;
	undo: string;
	redo: string;
	bold: string;
	italic: string;
	underline: string;
	heading1: string;
	heading2: string;
	paragraph: string;

	// Finance
	price: string;
	quantity: string;
	spread: string;
	noPeriods: string;
	uptimeCount: (status: "up" | "degraded" | "down" | "none", count: number) => string;
}

export const enMessages: NquiMessages = {
	close: "Close",
	dismiss: "Dismiss",
	remove: "Remove",
	removeItem: (name) => `Remove ${name}`,
	copy: "Copy",
	copied: "Copied",
	loading: "Loading",
	searchPlaceholder: "Search…",
	filterPlaceholder: "Filter…",
	noResults: "No results.",
	noMatches: "No matches.",
	expand: "Expand",
	collapse: "Collapse",
	total: "Total",

	pagination: "Pagination",
	previousPage: "Previous page",
	nextPage: "Next page",
	pageLabel: (page) => `Page ${page}`,

	sidebar: "Sidebar",
	showSidebar: "Show sidebar",
	hideSidebar: "Hide sidebar",
	closeSidebar: "Close sidebar",
	resizeSidebar: "Resize sidebar",

	commandPalette: "Command palette",
	commandSearch: "Search commands",
	commandPlaceholder: "Type a command or search…",
	commandNavigate: "navigate",
	commandSelect: "select",

	goodResponse: "Good response",
	badResponse: "Bad response",
	regenerate: "Regenerate",

	uploadFiles: "Upload files",
	browseFiles: "Browse files",
	upload: "Upload",
	anyFileType: "Any file type",
	upToSize: (size) => `up to ${size}`,
	uploading: (percent) => (percent === undefined ? "Uploading…" : `Uploading · ${percent}%`),
	uploaded: "Uploaded",
	uploadFailed: "Upload failed",
	uploadProgress: (name) => `${name} upload progress`,
	fileTypeRejected: (name) => `${name}: unsupported type`,
	fileSizeRejected: (name, maxSize) => `${name}: larger than ${maxSize}`,
	fileCountRejected: (name) => `${name}: too many files`,

	noRows: "No rows",
	noRowsHint: "Try a different search or clear the filters.",
	searchRows: "Search rows",
	filter: "Filter",
	filters: "Filters",
	activeFilters: "Active filters",
	resetFilters: "Reset",
	columns: "Columns",
	containsPlaceholder: "Contains…",
	minPlaceholder: "Min",
	maxPlaceholder: "Max",
	minimumOf: (column) => `${column} minimum`,
	maximumOf: (column) => `${column} maximum`,
	yes: "Yes",
	no: "No",
	selectAll: "Select all",
	selectRow: "Select row",
	rowCount: (count, n) => `${count} ${n === 1 ? "row" : "rows"}`,
	rowsOfTotal: (shown, total) => `${shown} of ${total} rows`,
	selectedCount: (n) => `${n} selected`,
	pageOfTotal: (page, total) => `Page ${page} of ${total}`,
	rowsPerPage: "Rows per page",
	perPage: (size) => `${size} / page`,

	searchLogs: "Search logs",
	follow: "Follow",
	following: "Following",
	paused: "Paused",
	noLogLines: "No log lines.",

	copyJson: "Copy JSON",
	schema: "Schema",
	previewSections: "Preview sections",
	sample: "Sample",
	column: "Column",
	type: "Type",
	nulls: "Nulls",
	distinct: "Distinct",
	distribution: "Distribution",
	mean: "Mean",
	descriptionHeader: "Description",
	rows: "Rows",
	nullCells: "Null cells",
	size: "Size",

	linkToSection: "Link to this section",
	copyCode: "Copy code",

	queryFailed: "Query failed",
	results: "Results",
	running: "Running…",
	noResultsYet: "No results yet",
	runQueryHint: "Run a query with ⌘↵ to see rows here.",

	composer: "Composer",
	message: "Message",
	messagePlaceholder: "Write a message…",
	send: "Send",
	attachImage: "Attach image",
	attachments: "Attachments",
	previewMarkdown: "Preview Markdown",
	backToEditing: "Back to editing",
	nothingToPreview: "Nothing to preview.",
	undo: "Undo",
	redo: "Redo",
	bold: "Bold",
	italic: "Italic",
	underline: "Underline",
	heading1: "Heading 1",
	heading2: "Heading 2",
	paragraph: "Paragraph",

	price: "Price",
	quantity: "Size",
	spread: "Spread",
	noPeriods: "No periods",
	uptimeCount: (status, count) => `${count} ${status === "none" ? "no data" : status}`,
};

export const zhCNMessages: NquiMessages = {
	close: "关闭",
	dismiss: "关闭",
	remove: "移除",
	removeItem: (name) => `移除 ${name}`,
	copy: "复制",
	copied: "已复制",
	loading: "加载中",
	searchPlaceholder: "搜索…",
	filterPlaceholder: "筛选…",
	noResults: "无结果。",
	noMatches: "无匹配项。",
	expand: "展开",
	collapse: "收起",
	total: "合计",

	pagination: "分页",
	previousPage: "上一页",
	nextPage: "下一页",
	pageLabel: (page) => `第 ${page} 页`,

	sidebar: "侧边栏",
	showSidebar: "显示侧边栏",
	hideSidebar: "隐藏侧边栏",
	closeSidebar: "关闭侧边栏",
	resizeSidebar: "调整侧边栏宽度",

	commandPalette: "命令面板",
	commandSearch: "搜索命令",
	commandPlaceholder: "输入命令或搜索…",
	commandNavigate: "切换",
	commandSelect: "选择",

	goodResponse: "有帮助",
	badResponse: "没帮助",
	regenerate: "重新生成",

	uploadFiles: "上传文件",
	browseFiles: "浏览文件",
	upload: "上传",
	anyFileType: "任意文件类型",
	upToSize: (size) => `最大 ${size}`,
	uploading: (percent) => (percent === undefined ? "上传中…" : `上传中 · ${percent}%`),
	uploaded: "已上传",
	uploadFailed: "上传失败",
	uploadProgress: (name) => `${name} 上传进度`,
	fileTypeRejected: (name) => `${name}：不支持的文件类型`,
	fileSizeRejected: (name, maxSize) => `${name}：超过 ${maxSize}`,
	fileCountRejected: (name) => `${name}：文件数量超出上限`,

	noRows: "暂无数据",
	noRowsHint: "换个关键词，或清除筛选条件。",
	searchRows: "搜索行",
	filter: "筛选",
	filters: "筛选条件",
	activeFilters: "已应用的筛选",
	resetFilters: "重置",
	columns: "列",
	containsPlaceholder: "包含…",
	minPlaceholder: "最小值",
	maxPlaceholder: "最大值",
	minimumOf: (column) => `${column} 最小值`,
	maximumOf: (column) => `${column} 最大值`,
	yes: "是",
	no: "否",
	selectAll: "全选",
	selectRow: "选择行",
	rowCount: (count) => `${count} 行`,
	rowsOfTotal: (shown, total) => `${shown} / ${total} 行`,
	selectedCount: (n) => `已选 ${n} 行`,
	pageOfTotal: (page, total) => `第 ${page} / ${total} 页`,
	rowsPerPage: "每页行数",
	perPage: (size) => `${size} 条/页`,

	searchLogs: "搜索日志",
	follow: "跟随",
	following: "跟随中",
	paused: "已暂停",
	noLogLines: "暂无日志。",

	copyJson: "复制 JSON",
	schema: "结构",
	previewSections: "预览分区",
	sample: "样本",
	column: "列",
	type: "类型",
	nulls: "空值",
	distinct: "去重数",
	distribution: "分布",
	mean: "均值",
	descriptionHeader: "说明",
	rows: "行数",
	nullCells: "空值占比",
	size: "大小",

	linkToSection: "链接到此章节",
	copyCode: "复制代码",

	queryFailed: "查询失败",
	results: "结果",
	running: "运行中…",
	noResultsYet: "暂无结果",
	runQueryHint: "按 ⌘↵ 运行查询，结果会显示在这里。",

	composer: "编辑器",
	message: "消息",
	messagePlaceholder: "输入消息…",
	send: "发送",
	attachImage: "添加图片",
	attachments: "附件",
	previewMarkdown: "预览 Markdown",
	backToEditing: "返回编辑",
	nothingToPreview: "没有可预览的内容。",
	undo: "撤销",
	redo: "重做",
	bold: "粗体",
	italic: "斜体",
	underline: "下划线",
	heading1: "一级标题",
	heading2: "二级标题",
	paragraph: "正文",

	price: "价格",
	quantity: "数量",
	spread: "价差",
	noPeriods: "暂无数据",
	uptimeCount: (status, count) =>
		`${{ up: "正常", degraded: "降级", down: "故障", none: "无数据" }[status]} ${count}`,
};

/** The built-in catalog for a BCP 47 locale: Chinese for any `zh` locale, English otherwise. */
export function messagesForLocale(locale: string): NquiMessages {
	return locale.toLowerCase().startsWith("zh") ? zhCNMessages : enMessages;
}
