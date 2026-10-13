import { json } from "@codemirror/lang-json";
import { useDeferredValue, useMemo } from "react";
import {
  CodeEditor,
  CopyButton,
  InputActions,
  Option,
  OptionSwitch,
  Segmented,
  SplitView,
  StatusMessage,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { indentChoices } from "@/tools/shared/indent";
import { sampleJson } from "@/tools/shared/json";
import { describeText } from "@/tools/shared/text";
import { formatJson, type JsonStyle } from "./logic";

const jsonLanguage = json();
const styleChoices = [...indentChoices, { value: "minify" as const, label: "Minify" }];

export default function JsonFormatterTool() {
  const [input, setInput] = usePersistentState("input", "");
  const [style, setStyle] = usePersistentState<JsonStyle>("style", "2");
  const [sortKeys, setSortKeys] = usePersistentState("sortKeys", false);

  const deferredInput = useDeferredValue(input);
  const result = useMemo(
    () => formatJson(deferredInput, { style, sortKeys }),
    [deferredInput, style, sortKeys],
  );
  const output = result.ok ? result.output : "";

  return (
    <ToolPage>
      <ToolOptions>
        <Option label="Indent">
          <Segmented value={style} onChange={setStyle} choices={styleChoices} />
        </Option>
        <OptionSwitch label="Sort keys" checked={sortKeys} onChange={setSortKeys} />
      </ToolOptions>
      <SplitView>
        <ToolSection
          title="Input"
          meta={describeText(input)}
          actions={<InputActions value={input} onChange={setInput} sample={sampleJson} />}
          fill
          padded={false}
        >
          <CodeEditor value={input} onChange={setInput} language={jsonLanguage} placeholder="Paste JSON here" />
        </ToolSection>
        <ToolSection
          title="Output"
          meta={result.ok ? describeText(output) : undefined}
          actions={<CopyButton value={output} />}
          fill
          padded={false}
        >
          {result.ok ? (
            <CodeEditor value={output} language={jsonLanguage} readOnly />
          ) : (
            <StatusMessage tone="error" className="mx-4">
              {result.error}
            </StatusMessage>
          )}
        </ToolSection>
      </SplitView>
    </ToolPage>
  );
}
