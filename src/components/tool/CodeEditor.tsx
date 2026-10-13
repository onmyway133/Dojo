import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/stores/settings";
import { editorTheme } from "./editorTheme";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  /** Language support, e.g. `json()`. Each tool imports only what it needs. */
  language?: Extension;
  /** Any extra CodeMirror extensions (linters, decorations). */
  extensions?: Extension[];
  readOnly?: boolean;
  placeholder?: string;
  lineNumbers?: boolean;
  className?: string;
}

/** CodeMirror 6 editor styled for section backgrounds. Fills its parent's height. */
export function CodeEditor({
  value,
  onChange,
  language,
  extensions,
  readOnly = false,
  placeholder,
  lineNumbers = true,
  className,
}: CodeEditorProps) {
  const fontSize = useSettings((s) => s.editorFontSize);
  const wrap = useSettings((s) => s.editorWrap);

  const allExtensions = useMemo(
    () => [
      editorTheme,
      EditorView.theme({ ".cm-scroller": { fontSize: `${fontSize}px` } }),
      ...(wrap ? [EditorView.lineWrapping] : []),
      ...(language ? [language] : []),
      ...(extensions ?? []),
    ],
    [fontSize, wrap, language, extensions],
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      editable={!readOnly}
      placeholder={placeholder}
      theme="none"
      height="100%"
      extensions={allExtensions}
      basicSetup={{
        lineNumbers,
        foldGutter: lineNumbers,
        highlightActiveLine: !readOnly,
        highlightActiveLineGutter: !readOnly,
        autocompletion: false,
        searchKeymap: true,
        tabSize: 2,
      }}
      className={cn("min-h-0 flex-1 overflow-hidden rounded-b-xl text-left", className)}
    />
  );
}
