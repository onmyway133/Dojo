import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

// Colors come from CSS variables, so one theme serves light and dark mode and the
// editor sits on whatever section fill is behind it.
const baseTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "transparent",
    color: "var(--foreground)",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
    lineHeight: "1.55",
  },
  ".cm-content": { padding: "2px 0 12px", caretColor: "var(--primary)" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--primary)", borderLeftWidth: "2px" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "var(--code-selection) !important",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "var(--muted-foreground)",
    border: "none",
    opacity: "0.7",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 10px 0 14px", minWidth: "36px" },
  ".cm-activeLine": { backgroundColor: "var(--field)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--foreground)" },
  ".cm-foldPlaceholder": {
    backgroundColor: "var(--field-hover)",
    border: "none",
    color: "var(--muted-foreground)",
    padding: "0 6px",
    borderRadius: "4px",
  },
  ".cm-matchingBracket": { backgroundColor: "var(--selected)", outline: "none" },
  ".cm-selectionMatch": { backgroundColor: "var(--field-hover)" },
  ".cm-searchMatch": { backgroundColor: "oklch(0.85 0.15 90 / 45%)" },
  ".cm-placeholder": { color: "var(--muted-foreground)" },
  ".cm-panels": { backgroundColor: "var(--popover)", color: "var(--foreground)", border: "none" },
  ".cm-tooltip": {
    backgroundColor: "var(--popover)",
    border: "none",
    borderRadius: "8px",
    boxShadow: "0 6px 24px rgb(0 0 0 / 0.18)",
  },
});

const highlightStyle = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword, t.modifier, t.controlKeyword], color: "var(--code-keyword)", fontWeight: "600" },
  { tag: [t.bool, t.null, t.atom], color: "var(--code-keyword)" },
  { tag: [t.string, t.special(t.string), t.regexp], color: "var(--code-string)" },
  { tag: [t.number, t.integer, t.float], color: "var(--code-number)" },
  { tag: [t.propertyName, t.definition(t.propertyName)], color: "var(--code-property)" },
  { tag: [t.typeName, t.className, t.namespace], color: "var(--code-type)" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "var(--code-type)" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--code-comment)", fontStyle: "italic" },
  { tag: [t.tagName, t.angleBracket], color: "var(--code-tag)" },
  { tag: t.attributeName, color: "var(--code-attribute)" },
  { tag: [t.heading], color: "var(--code-keyword)", fontWeight: "700" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strong, fontWeight: "700" },
  { tag: t.link, color: "var(--primary)", textDecoration: "underline" },
  { tag: t.invalid, color: "var(--destructive)" },
]);

export const editorTheme = [baseTheme, syntaxHighlighting(highlightStyle)];
