import { getChunks, MergeView } from "@codemirror/merge";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/stores/settings";
import { editorTheme } from "./editorTheme";

interface DiffEditorProps {
  original: string;
  modified: string;
  onOriginalChange?: (value: string) => void;
  onModifiedChange?: (value: string) => void;
  language?: Extension;
  collapseUnchanged?: boolean;
  /** Called with the number of changed chunks whenever the diff updates. */
  onChunks?: (count: number) => void;
  className?: string;
}

const diffTheme = EditorView.theme({
  "&.cm-merge-a .cm-changedLine, .cm-deletedChunk": { backgroundColor: "color-mix(in oklab, var(--destructive) 12%, transparent)" },
  "&.cm-merge-b .cm-changedLine, .cm-inlineChangedLine": { backgroundColor: "color-mix(in oklab, var(--success) 12%, transparent)" },
  "&.cm-merge-a .cm-changedText, .cm-deletedChunk .cm-deletedText": { background: "color-mix(in oklab, var(--destructive) 30%, transparent)" },
  "&.cm-merge-b .cm-changedText": { background: "color-mix(in oklab, var(--success) 30%, transparent)" },
  ".cm-changeGutter": { width: "3px", paddingLeft: "0" },
  "&.cm-merge-a .cm-changedLineGutter": { background: "var(--destructive)" },
  "&.cm-merge-b .cm-changedLineGutter": { background: "var(--success)" },
  ".cm-collapsedLines": {
    background: "var(--ds-row-hover-bg)",
    color: "var(--muted-foreground)",
    padding: "4px 12px",
    cursor: "default",
  },
});

/** Side-by-side diff of two editable documents (CodeMirror merge view). */
export function DiffEditor({
  original,
  modified,
  onOriginalChange,
  onModifiedChange,
  language,
  collapseUnchanged = false,
  onChunks,
  className,
}: DiffEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<MergeView | null>(null);
  const callbacks = useRef({ onOriginalChange, onModifiedChange, onChunks });
  callbacks.current = { onOriginalChange, onModifiedChange, onChunks };
  const fontSize = useSettings((s) => s.editorFontSize);
  const wrap = useSettings((s) => s.editorWrap);

  // Rebuild only when configuration changes; text updates are dispatched below.
  useEffect(() => {
    if (!host.current) return;
    const shared = [
      basicSetup({ foldGutter: false, highlightActiveLine: false, autocompletion: false }),
      editorTheme,
      diffTheme,
      EditorView.theme({ ".cm-scroller": { fontSize: `${fontSize}px` } }),
      ...(wrap ? [EditorView.lineWrapping] : []),
      ...(language ? [language] : []),
    ];
    const report = () => {
      const chunks = view.current ? getChunks(view.current.b.state)?.chunks.length : undefined;
      if (chunks !== undefined) callbacks.current.onChunks?.(chunks);
    };
    const merge = new MergeView({
      a: {
        doc: original,
        extensions: [
          ...shared,
          EditorView.updateListener.of((u) => {
            if (u.docChanged) callbacks.current.onOriginalChange?.(u.state.doc.toString());
          }),
        ],
      },
      b: {
        doc: modified,
        extensions: [
          ...shared,
          EditorView.updateListener.of((u) => {
            if (u.docChanged) callbacks.current.onModifiedChange?.(u.state.doc.toString());
            report();
          }),
        ],
      },
      parent: host.current,
      collapseUnchanged: collapseUnchanged ? { margin: 3, minSize: 4 } : undefined,
      gutter: true,
    });
    view.current = merge;
    queueMicrotask(report);
    return () => {
      merge.destroy();
      view.current = null;
    };
    // `original`/`modified` are synced separately so typing doesn't rebuild the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, collapseUnchanged, fontSize, wrap]);

  // Push outside changes (paste, sample, swap) into the editors.
  useEffect(() => {
    const merge = view.current;
    if (!merge) return;
    for (const [editor, text] of [
      [merge.a, original],
      [merge.b, modified],
    ] as const) {
      if (editor.state.doc.toString() !== text) {
        editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: text } });
      }
    }
  }, [original, modified]);

  return (
    <div
      ref={host}
      className={cn(
        "ds-well min-h-0 flex-1 overflow-auto text-left [&_.cm-mergeView]:h-full [&_.cm-mergeViewEditors]:min-h-full [&_.cm-editor]:bg-transparent",
        className,
      )}
    />
  );
}
