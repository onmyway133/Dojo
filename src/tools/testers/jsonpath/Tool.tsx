import { json } from "@codemirror/lang-json";
import { useDeferredValue, useMemo } from "react";
import {
  Chip,
  CodeEditor,
  CopyButton,
  InputActions,
  SplitView,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Input } from "@/components/ui/input";
import { queryJson } from "./logic";

const jsonLanguage = json();
const sample = JSON.stringify(
  {
    store: {
      book: [
        { category: "reference", author: "Nigel Rees", title: "Sayings of the Century", price: 8.95 },
        { category: "fiction", author: "Evelyn Waugh", title: "Sword of Honour", price: 12.99 },
        { category: "fiction", author: "J. R. R. Tolkien", title: "The Lord of the Rings", isbn: "0-395-19395-8", price: 22.99 },
      ],
      bicycle: { color: "red", price: 19.95 },
    },
  },
  null,
  2,
);
const examples = ["$.store.book[*].author", "$..price", "$.store.book[?(@.price < 10)]", "$.store.book[-1:]", "$..book[?(@.isbn)].title"];

export default function JsonPathTool() {
  const [input, setInput] = usePersistentState("input", sample);
  const [path, setPath] = usePersistentState("path", "$.store.book[*].author");
  const deferredInput = useDeferredValue(input);
  const result = useMemo(() => queryJson(deferredInput, path), [deferredInput, path]);
  const output = result.ok ? JSON.stringify(result.matches.map((m) => m.value), null, 2) : "";

  return (
    <ToolPage>
      <ToolSection title="Expression" className="shrink-0">
        <Input value={path} onChange={(e) => setPath(e.target.value)} spellCheck={false} className="h-9 font-mono text-[14px]" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {examples.map((example) => (
            <Chip key={example} selected={example === path} onClick={() => setPath(example)} className="font-mono">
              {example}
            </Chip>
          ))}
        </div>
      </ToolSection>
      <SplitView>
        <ToolSection title="JSON" actions={<InputActions value={input} onChange={setInput} sample={sample} />} fill padded={false}>
          <CodeEditor value={input} onChange={setInput} language={jsonLanguage} />
        </ToolSection>
        <ToolSection
          title="Results"
          meta={result.ok ? `${result.matches.length} ${result.matches.length === 1 ? "match" : "matches"}` : undefined}
          actions={<CopyButton value={output} />}
          fill
          padded={false}
        >
          {result.ok ? (
            <CodeEditor value={output} language={jsonLanguage} readOnly />
          ) : (
            <StatusMessage tone="error" className="mx-4">{result.error}</StatusMessage>
          )}
        </ToolSection>
      </SplitView>
    </ToolPage>
  );
}
