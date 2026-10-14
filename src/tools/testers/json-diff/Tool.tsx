import { json } from "@codemirror/lang-json";
import { useDeferredValue, useMemo } from "react";
import {
  CodeEditor,
  InputActions,
  SplitView,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { diffJsonText, type JsonChange } from "./logic";

const jsonLanguage = json();
const sampleA = JSON.stringify({ name: "dojo", version: "1.0.0", tags: ["json", "mac"], owner: { login: "khoa", plan: "free" } }, null, 2);
const sampleB = JSON.stringify({ name: "dojo", version: "1.1.0", tags: ["json"], owner: { login: "khoa" }, license: "MIT" }, null, 2);

const show = (value: unknown) => (value === undefined ? "" : JSON.stringify(value));
const kindBadge = { added: "default", removed: "destructive", changed: "secondary" } as const;

function ChangeRow({ change }: { change: JsonChange }) {
  return (
    <li className="ds-row flex items-start gap-3 rounded-lg px-2 py-1.5 text-[13px]">
      <div className="mt-px w-18 shrink-0">
        <Badge variant={kindBadge[change.kind]}>{change.kind}</Badge>
      </div>
      <code className="w-56 shrink-0 truncate font-mono text-[12.5px] select-text" title={change.path}>{change.path}</code>
      <div className="min-w-0 flex-1 font-mono text-[12.5px] select-text [overflow-wrap:anywhere]">
        {change.kind !== "added" && <span className="text-destructive line-through decoration-destructive/40">{show(change.before)}</span>}
        {change.kind === "changed" && <span className="px-1.5 text-muted-foreground">→</span>}
        {change.kind !== "removed" && <span className="text-success">{show(change.after)}</span>}
      </div>
    </li>
  );
}

export default function JsonDiffTool() {
  const [left, setLeft] = usePersistentState("left", sampleA);
  const [right, setRight] = usePersistentState("right", sampleB);
  const deferredLeft = useDeferredValue(left);
  const deferredRight = useDeferredValue(right);
  const result = useMemo(() => diffJsonText(deferredLeft, deferredRight), [deferredLeft, deferredRight]);

  return (
    <ToolPage>
      <SplitView>
        <ToolSection title="Before" actions={<InputActions value={left} onChange={setLeft} sample={sampleA} />} fill padded={false}>
          <CodeEditor value={left} onChange={setLeft} language={jsonLanguage} />
        </ToolSection>
        <ToolSection title="After" actions={<InputActions value={right} onChange={setRight} sample={sampleB} />} fill padded={false}>
          <CodeEditor value={right} onChange={setRight} language={jsonLanguage} />
        </ToolSection>
      </SplitView>
      <ToolSection
        title="Changes"
        meta={result.ok ? `${result.changes.length} ${result.changes.length === 1 ? "difference" : "differences"}` : undefined}
        className="max-h-80 shrink-0 overflow-y-auto"
      >
        {!result.ok && <StatusMessage tone="error">{result.error}</StatusMessage>}
        {result.ok && result.changes.length === 0 && <StatusMessage tone="success">The documents are equal.</StatusMessage>}
        {result.ok && result.changes.length > 0 && (
          <ul className="-mx-2 flex flex-col gap-0.5">
            {result.changes.map((change) => (
              <ChangeRow key={`${change.kind}-${change.path}`} change={change} />
            ))}
          </ul>
        )}
      </ToolSection>
    </ToolPage>
  );
}
