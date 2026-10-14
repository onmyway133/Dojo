import { javascript } from "@codemirror/lang-javascript";
import { useEffect, useState } from "react";
import { CodeEditor, CopyButton, ResultList, ResultRow, ToolPage, ToolSection } from "@/components/tool";
import { type KeyInfo, keyInfo, locationName, matchSnippet, shortcutLabel } from "./logic";

const modifiers: [keyof KeyInfo, string][] = [
  ["ctrlKey", "⌃ Control"],
  ["altKey", "⌥ Option"],
  ["shiftKey", "⇧ Shift"],
  ["metaKey", "⌘ Command"],
];

const js = javascript();

export default function KeyCodeTool() {
  const [last, setLast] = useState<KeyInfo>();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // Leave typing in fields alone, and let ⌘ shortcuts reach the app.
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable=true]")) return;
      if (!event.metaKey) event.preventDefault();
      setLast(keyInfo(event));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const label = last ? shortcutLabel(last) : "";

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Key" actions={last && <CopyButton label="Copy Shortcut" value={label} />}>
        <div className="ds-well m-0 flex h-36 flex-col items-center justify-center gap-2">
          {last ? (
            <>
              <span className="text-5xl font-semibold tracking-wide">{label}</span>
              <div className="flex gap-1.5">
                {modifiers.map(([key, name]) => (
                  <span
                    key={key}
                    data-selected={last[key] ? "true" : undefined}
                    className="ds-chip inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <span className="text-[15px] text-muted-foreground">Press any key</span>
          )}
        </div>
      </ToolSection>
      {last && (
        <>
          <ToolSection title="Event">
            <ResultList>
              <ResultRow label="event.key" value={JSON.stringify(last.key)} mono />
              <ResultRow label="event.code" value={JSON.stringify(last.code)} mono />
              <ResultRow label="event.keyCode" value={String(last.keyCode)} mono />
              <ResultRow label="event.location" value={`${last.location} (${locationName(last.location)})`} mono />
              <ResultRow label="event.repeat" value={String(last.repeat)} mono />
            </ResultList>
          </ToolSection>
          <ToolSection title="Match in Code" actions={<CopyButton value={matchSnippet(last)} />} padded={false}>
            <div className="h-24">
              <CodeEditor value={matchSnippet(last)} language={js} readOnly lineNumbers={false} />
            </div>
          </ToolSection>
        </>
      )}
    </ToolPage>
  );
}
