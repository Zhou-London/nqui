import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

/** Editor chrome driven entirely by NQUI CSS variables, so it follows light/dark automatically. */
export const nquiEditorTheme: Extension = EditorView.theme({
	"&": {
		color: "var(--nq-fg)",
		backgroundColor: "transparent",
		fontSize: "14px",
	},
	".cm-content": {
		fontFamily: "var(--nq-font-mono)",
		caretColor: "var(--nq-fg)",
		padding: "10px 0",
	},
	".cm-scroller": { fontFamily: "var(--nq-font-mono)", lineHeight: "1.6" },
	"&.cm-focused": { outline: "none" },
	".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--nq-fg)" },
	"&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection":
		{
			backgroundColor: "color-mix(in oklab, var(--nq-primary) 22%, transparent)",
		},
	".cm-activeLine": { backgroundColor: "color-mix(in oklab, var(--nq-fg) 3%, transparent)" },
	".cm-gutters": {
		backgroundColor: "transparent",
		color: "var(--nq-subtle)",
		border: "none",
		fontFamily: "var(--nq-font-mono)",
	},
	".cm-gutter.cm-lineNumbers .cm-gutterElement": { padding: "0 10px 0 14px", minWidth: "40px" },
	".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--nq-muted)" },
	".cm-foldGutter .cm-gutterElement": { color: "var(--nq-subtle)" },
	".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
		backgroundColor: "color-mix(in oklab, var(--nq-primary) 18%, transparent)",
		outline: "none",
	},
	".cm-selectionMatch": {
		backgroundColor: "color-mix(in oklab, var(--nq-warning) 22%, transparent)",
	},
	".cm-placeholder": { color: "var(--nq-subtle)", fontStyle: "normal" },
	".cm-tooltip": {
		border: "1px solid var(--nq-border)",
		backgroundColor: "var(--nq-surface)",
		color: "var(--nq-fg)",
		borderRadius: "10px",
		boxShadow: "var(--nq-shadow-lg)",
		overflow: "hidden",
		fontFamily: "var(--nq-font-sans)",
	},
	".cm-tooltip.cm-tooltip-autocomplete > ul": {
		fontFamily: "var(--nq-font-mono)",
		fontSize: "12px",
		maxHeight: "16em",
	},
	".cm-tooltip.cm-tooltip-autocomplete > ul > li": { padding: "4px 10px", lineHeight: "1.5" },
	".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
		backgroundColor: "var(--nq-surface-2)",
		color: "var(--nq-fg)",
	},
	".cm-completionIcon": { width: "1.2em", opacity: "0.7" },
	".cm-completionLabel": { color: "var(--nq-fg)" },
	".cm-completionDetail": { color: "var(--nq-muted)", fontStyle: "normal", marginLeft: "0.75em" },
	".cm-completionMatchedText": {
		textDecoration: "none",
		color: "var(--nq-primary-text)",
		fontWeight: "600",
	},
	".cm-panels": {
		backgroundColor: "var(--nq-surface-2)",
		color: "var(--nq-fg)",
		borderColor: "var(--nq-border)",
	},
	".cm-panel input, .cm-panel button": { fontFamily: "var(--nq-font-sans)" },
	".cm-searchMatch": { backgroundColor: "color-mix(in oklab, var(--nq-warning) 30%, transparent)" },
	".cm-searchMatch.cm-searchMatch-selected": {
		backgroundColor: "color-mix(in oklab, var(--nq-warning) 55%, transparent)",
	},
});

export const nquiHighlightStyle = HighlightStyle.define([
	{
		tag: [t.keyword, t.operatorKeyword, t.modifier, t.controlKeyword, t.definitionKeyword],
		color: "var(--nq-syntax-keyword)",
		fontWeight: "600",
	},
	{ tag: [t.string, t.special(t.string)], color: "var(--nq-syntax-string)" },
	{ tag: [t.number, t.integer, t.float, t.bool, t.null], color: "var(--nq-syntax-number)" },
	{
		tag: [t.comment, t.lineComment, t.blockComment],
		color: "var(--nq-syntax-comment)",
		fontStyle: "italic",
	},
	{
		tag: [t.operator, t.compareOperator, t.arithmeticOperator, t.logicOperator],
		color: "var(--nq-syntax-operator)",
	},
	{
		tag: [t.function(t.variableName), t.function(t.propertyName), t.standard(t.name)],
		color: "var(--nq-syntax-function)",
	},
	{ tag: [t.typeName, t.className], color: "var(--nq-syntax-type)" },
	{ tag: [t.variableName, t.propertyName, t.name], color: "var(--nq-syntax-variable)" },
	{ tag: [t.punctuation, t.separator, t.bracket, t.paren], color: "var(--nq-syntax-punctuation)" },
]);

export const nquiSyntax: Extension = syntaxHighlighting(nquiHighlightStyle);
