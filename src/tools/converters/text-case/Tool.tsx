import { useDeferredValue } from "react";
import {
  CodeEditor,
  InputActions,
  ResultList,
  ResultRow,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { caseStyles, convertLines } from "./logic";

export default function TextCaseTool() {
  const [input, setInput] = usePersistentState("input", "");
  const text = useDeferredValue(input);

  return (
    <ToolPage>
      <ToolSection
        title="Text"
        meta="Each line converts separately"
        actions={<InputActions value={input} onChange={setInput} sample={"user profile id\nparseHTTPResponse\nmax_retry_count"} />}
        padded={false}
        className="h-40 shrink-0"
      >
        <CodeEditor value={input} onChange={setInput} lineNumbers={false} placeholder="Type words or identifiers" />
      </ToolSection>
      <ToolSection title="Cases" fill className="overflow-y-auto">
        <ResultList>
          {caseStyles.map((style) => (
            <ResultRow key={style.id} label={style.name} value={text ? convertLines(text, style) : ""} mono />
          ))}
        </ResultList>
      </ToolSection>
    </ToolPage>
  );
}
