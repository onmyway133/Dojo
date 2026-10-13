import type { Extension } from "@codemirror/state";
import { type ReactNode, useDeferredValue } from "react";
import { useAsync } from "@/hooks/useAsync";
import { describeText } from "@/tools/shared/text";
import { CopyButton, InputActions } from "./actions";
import { CodeEditor } from "./CodeEditor";
import { SplitView } from "./SplitView";
import { StatusMessage } from "./StatusMessage";
import { usePersistentState } from "./ToolContext";
import { ToolPage } from "./ToolPage";
import { ToolSection } from "./ToolSection";

export interface TransformToolProps {
  /**
   * Turns input into output. Throw to show an error. Keep it referentially stable
   * (module function or useCallback) since a new function re-runs the transform.
   */
  transform: (input: string) => string | Promise<string>;
  inputLanguage?: Extension;
  outputLanguage?: Extension;
  /** A ToolOptions row shown above the editors. */
  options?: ReactNode;
  sample?: string;
  inputTitle?: string;
  outputTitle?: string;
  placeholder?: string;
}

/** Input editor beside an output editor: the layout shared by formatters and converters. */
export function TransformTool({
  transform,
  inputLanguage,
  outputLanguage = inputLanguage,
  options,
  sample,
  inputTitle = "Input",
  outputTitle = "Output",
  placeholder = "Paste or type input",
}: TransformToolProps) {
  const [input, setInput] = usePersistentState("input", "");
  const deferredInput = useDeferredValue(input);

  const result = useAsync(
    () => (deferredInput.trim() ? Promise.resolve().then(() => transform(deferredInput)) : undefined),
    [deferredInput, transform],
  );
  const output = result.status === "success" || result.status === "loading" ? (result.value ?? "") : "";

  return (
    <ToolPage>
      {options}
      <SplitView>
        <ToolSection
          title={inputTitle}
          meta={describeText(input)}
          actions={<InputActions value={input} onChange={setInput} sample={sample} />}
          fill
          padded={false}
        >
          <CodeEditor value={input} onChange={setInput} language={inputLanguage} placeholder={placeholder} />
        </ToolSection>
        <ToolSection
          title={outputTitle}
          meta={result.status === "error" ? undefined : describeText(output)}
          actions={<CopyButton value={output} />}
          fill
          padded={false}
        >
          {result.status === "error" ? (
            <StatusMessage tone="error" className="mx-4 whitespace-pre-wrap">
              {result.error}
            </StatusMessage>
          ) : (
            <CodeEditor value={output} language={outputLanguage} readOnly />
          )}
        </ToolSection>
      </SplitView>
    </ToolPage>
  );
}
