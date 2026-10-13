import { json } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { type StreamParser, StreamLanguage } from "@codemirror/language";
import { csharp, dart, java, kotlin } from "@codemirror/legacy-modes/mode/clike";
import { go } from "@codemirror/legacy-modes/mode/go";
import { python } from "@codemirror/legacy-modes/mode/python";
import { rust } from "@codemirror/legacy-modes/mode/rust";
import { swift } from "@codemirror/legacy-modes/mode/swift";
import { useCallback } from "react";
import {
  Option,
  OptionSelect,
  OptionSwitch,
  ToolOptions,
  TransformTool,
  usePersistentState,
} from "@/components/tool";
import { Input } from "@/components/ui/input";
import { sampleJson } from "@/tools/shared/json";
import { type CodeLanguage, codeLanguageNames, generateTypes } from "./logic";

const stream = (parser: StreamParser<unknown>) => StreamLanguage.define(parser);

const outputLanguages: Record<CodeLanguage, ReturnType<typeof javascript> | StreamLanguage<unknown>> = {
  swift: stream(swift),
  typescript: javascript({ typescript: true }),
  kotlin: stream(kotlin),
  go: stream(go),
  rust: stream(rust),
  python: stream(python),
  csharp: stream(csharp),
  java: stream(java),
  dart: stream(dart),
};

const languageChoices = (Object.keys(codeLanguageNames) as CodeLanguage[]).map((value) => ({
  value,
  label: codeLanguageNames[value],
}));

const jsonLanguage = json();

export default function JsonToCodeTool() {
  const [language, setLanguage] = usePersistentState<CodeLanguage>("language", "swift");
  const [typeName, setTypeName] = usePersistentState("typeName", "Root");
  const [typesOnly, setTypesOnly] = usePersistentState("typesOnly", true);

  const transform = useCallback(
    (input: string) => generateTypes(input, { language, typeName, typesOnly }),
    [language, typeName, typesOnly],
  );

  return (
    <TransformTool
      transform={transform}
      inputTitle="JSON"
      outputTitle={codeLanguageNames[language]}
      inputLanguage={jsonLanguage}
      outputLanguage={outputLanguages[language]}
      sample={sampleJson}
      placeholder="Paste a JSON sample"
      options={
        <ToolOptions>
          <Option label="Language">
            <OptionSelect value={language} onChange={setLanguage} choices={languageChoices} />
          </Option>
          <Option label="Type name">
            <Input value={typeName} onChange={(e) => setTypeName(e.target.value)} className="h-7 w-36 text-[13px]" />
          </Option>
          {language !== "rust" && <OptionSwitch label="Types only" checked={typesOnly} onChange={setTypesOnly} />}
        </ToolOptions>
      }
    />
  );
}
