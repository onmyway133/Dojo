import {
  CodeEditor,
  InputActions,
  OptionSwitch,
  ResultList,
  ResultRow,
  StatusMessage,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { useAsync } from "@/hooks/useAsync";
import { useDebounced } from "@/hooks/useDebounced";
import { hashAlgorithmNames, hashText } from "@/tools/shared/hash";
import { describeText } from "@/tools/shared/text";

export default function HashTool() {
  const [input, setInput] = usePersistentState("input", "");
  const [uppercase, setUppercase] = usePersistentState("uppercase", false);
  const debounced = useDebounced(input, 150);
  const hashes = useAsync(() => hashText(debounced), [debounced]);

  const values = hashes.status === "success" || hashes.status === "loading" ? hashes.value : undefined;

  return (
    <ToolPage>
      <ToolOptions>
        <OptionSwitch label="Uppercase" checked={uppercase} onChange={setUppercase} />
      </ToolOptions>
      <ToolSection
        title="Text"
        meta={describeText(input)}
        actions={<InputActions value={input} onChange={setInput} sample="The quick brown fox jumps over the lazy dog" />}
        fill
        padded={false}
        className="min-h-40"
      >
        <CodeEditor value={input} onChange={setInput} lineNumbers={false} placeholder="Type or paste text to hash" />
      </ToolSection>
      <ToolSection title="Digests" meta="UTF-8 input" className="shrink-0">
        {hashes.status === "error" ? (
          <StatusMessage tone="error">{hashes.error}</StatusMessage>
        ) : (
          <ResultList>
            {(values ?? []).map(({ algorithm, hex }) => {
              const value = uppercase ? hex.toUpperCase() : hex;
              return <ResultRow key={algorithm} label={hashAlgorithmNames[algorithm]} value={value} mono />;
            })}
          </ResultList>
        )}
      </ToolSection>
    </ToolPage>
  );
}
