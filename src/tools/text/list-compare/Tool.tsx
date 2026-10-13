import { useDeferredValue, useMemo } from "react";
import {
  CodeEditor,
  CopyButton,
  InputActions,
  OptionSwitch,
  SplitView,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { compareLists } from "./logic";

function ResultPanel({ title, items }: { title: string; items: string[] }) {
  const text = items.join("\n");
  return (
    <ToolSection title={title} meta={`${items.length}`} actions={<CopyButton value={text} />} fill padded={false}>
      <CodeEditor value={text} readOnly lineNumbers={false} placeholder="Nothing here" />
    </ToolSection>
  );
}

export default function ListCompareTool() {
  const [a, setA] = usePersistentState("a", "");
  const [b, setB] = usePersistentState("b", "");
  const [ignoreCase, setIgnoreCase] = usePersistentState("ignoreCase", false);
  const [trim, setTrim] = usePersistentState("trim", true);
  const deferredA = useDeferredValue(a);
  const deferredB = useDeferredValue(b);
  const result = useMemo(() => compareLists(deferredA, deferredB, { ignoreCase, trim }), [deferredA, deferredB, ignoreCase, trim]);

  return (
    <ToolPage>
      <ToolOptions>
        <OptionSwitch label="Ignore case" checked={ignoreCase} onChange={setIgnoreCase} />
        <OptionSwitch label="Trim whitespace" checked={trim} onChange={setTrim} />
      </ToolOptions>
      <SplitView>
        <ToolSection title="List A" actions={<InputActions value={a} onChange={setA} sample={"swift\nkotlin\nrust\ngo"} />} fill padded={false}>
          <CodeEditor value={a} onChange={setA} placeholder="One item per line" />
        </ToolSection>
        <ToolSection title="List B" actions={<InputActions value={b} onChange={setB} sample={"rust\ngo\ntypescript\nzig"} />} fill padded={false}>
          <CodeEditor value={b} onChange={setB} placeholder="One item per line" />
        </ToolSection>
      </SplitView>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 @3xl:grid-cols-3">
        <ResultPanel title="Only in A" items={result.onlyA} />
        <ResultPanel title="In both" items={result.both} />
        <ResultPanel title="Only in B" items={result.onlyB} />
      </div>
    </ToolPage>
  );
}
