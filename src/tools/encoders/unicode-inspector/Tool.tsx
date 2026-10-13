import { useDeferredValue, useMemo } from "react";
import {
  type Choice,
  CodeEditor,
  CopyButton,
  InputActions,
  Option,
  Segmented,
  StatusMessage,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { fromCodePoints, inspect } from "./logic";

type Mode = "inspect" | "decode";
const modeChoices: Choice<Mode>[] = [
  { value: "inspect", label: "Text → Code points" },
  { value: "decode", label: "Code points → Text" },
];
const maxRows = 400;

function InspectPanel() {
  const [text, setText] = usePersistentState("text", "Café 👋 ½");
  const deferred = useDeferredValue(text);
  const rows = useMemo(() => inspect(deferred), [deferred]);
  const all = {
    codePoints: rows.map((r) => r.label).join(" "),
    js: rows.map((r) => (r.codePoint < 128 ? r.char : r.js)).join(""),
    html: rows.map((r) => (r.codePoint < 128 ? r.char : r.html)).join(""),
  };

  return (
    <>
      <ToolSection title="Text" actions={<InputActions value={text} onChange={setText} />} padded={false} className="h-32 shrink-0">
        <CodeEditor value={text} onChange={setText} lineNumbers={false} />
      </ToolSection>
      <ToolSection
        title="Characters"
        meta={`${rows.length} code points`}
        actions={
          <>
            <CopyButton label="Copy as U+ list" value={all.codePoints} />
            <CopyButton label="Copy as JS escapes" value={all.js} />
            <CopyButton label="Copy as HTML entities" value={all.html} />
          </>
        }
        fill
        padded={false}
      >
        <div className="ds-well min-h-0 flex-1 overflow-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="sticky top-0 bg-(--ds-well-bg) text-xs text-muted-foreground">
              <tr>
                {["", "Code point", "UTF-8", "UTF-16", "JavaScript", "HTML"].map((h) => (
                  <th key={h} className="px-3 py-1.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-[12.5px] select-text">
              {rows.slice(0, maxRows).map((r, i) => (
                <tr key={i} className="odd:bg-(--ds-table-stripe)">
                  <td className="w-12 px-3 py-1 text-center font-sans text-[17px]">{r.char.trim() ? r.char : "␣"}</td>
                  <td className="px-3 py-1">{r.label}</td>
                  <td className="px-3 py-1">{r.utf8}</td>
                  <td className="px-3 py-1">{r.utf16}</td>
                  <td className="px-3 py-1">{r.js}</td>
                  <td className="px-3 py-1">{r.html}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ToolSection>
    </>
  );
}

function DecodePanel() {
  const [input, setInput] = usePersistentState("codes", "U+0048 U+0069 U+1F44B");
  const result = useMemo(() => {
    try {
      return { ok: true as const, text: fromCodePoints(input) };
    } catch (error) {
      return { ok: false as const, error: (error as Error).message };
    }
  }, [input]);

  return (
    <>
      <ToolSection title="Code points" meta="U+1F44B, \u{1F44B}, 👋, &#x1F44B;, &#128075; or hex" actions={<InputActions value={input} onChange={setInput} />} padded={false} className="h-40 shrink-0">
        <CodeEditor value={input} onChange={setInput} lineNumbers={false} />
      </ToolSection>
      <ToolSection title="Text" actions={result.ok ? <CopyButton value={result.text} /> : undefined}>
        {result.ok ? (
          <p className="text-[28px] select-text">{result.text || <span className="text-[13px] text-muted-foreground">Nothing yet</span>}</p>
        ) : (
          <StatusMessage tone="error">{result.error}</StatusMessage>
        )}
      </ToolSection>
    </>
  );
}

export default function UnicodeInspectorTool() {
  const [mode, setMode] = usePersistentState<Mode>("mode", "inspect");
  return (
    <ToolPage>
      <ToolOptions>
        <Option label="Mode">
          <Segmented value={mode} onChange={setMode} choices={modeChoices} />
        </Option>
      </ToolOptions>
      {mode === "inspect" ? <InspectPanel /> : <DecodePanel />}
    </ToolPage>
  );
}
