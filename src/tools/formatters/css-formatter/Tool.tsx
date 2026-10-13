import { css } from "@codemirror/lang-css";
import { useCallback } from "react";
import { type Choice, Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { indentChoices, prettierIndent, type Indent } from "@/tools/shared/indent";
import { prettierFormat } from "@/tools/shared/prettier";
import { minifyCss } from "./logic";

const language = css();

type Syntax = "css" | "scss" | "less";
type Mode = "beautify" | "minify";

const syntaxChoices: Choice<Syntax>[] = [
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "less", label: "Less" },
];
const modeChoices: Choice<Mode>[] = [
  { value: "beautify", label: "Beautify" },
  { value: "minify", label: "Minify" },
];

const sample = `:root{--accent:#0a84ff}.card{display:flex;gap:12px;padding:16px;border-radius:12px;background:var(--section)}.card:hover{background:color-mix(in oklch,var(--section),black 4%)}@media (prefers-color-scheme:dark){.card{background:#2a2a2a}}`;

export default function CssFormatterTool() {
  const [syntax, setSyntax] = usePersistentState<Syntax>("syntax", "css");
  const [mode, setMode] = usePersistentState<Mode>("mode", "beautify");
  const [indent, setIndent] = usePersistentState<Indent>("indent", "2");

  const transform = useCallback(
    (input: string) => (mode === "minify" ? minifyCss(input) : prettierFormat(input, syntax, prettierIndent(indent))),
    [syntax, mode, indent],
  );

  return (
    <TransformTool
      transform={transform}
      inputLanguage={language}
      sample={sample}
      placeholder="Paste CSS here"
      options={
        <ToolOptions>
          <Option label="Mode">
            <Segmented value={mode} onChange={setMode} choices={modeChoices} />
          </Option>
          <Option label="Syntax">
            <Segmented value={syntax} onChange={setSyntax} choices={syntaxChoices} />
          </Option>
          {mode === "beautify" && (
            <Option label="Indent">
              <Segmented value={indent} onChange={setIndent} choices={indentChoices} />
            </Option>
          )}
        </ToolOptions>
      }
    />
  );
}
