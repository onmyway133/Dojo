import { javascript } from "@codemirror/lang-javascript";
import { useCallback } from "react";
import {
  type Choice,
  Option,
  OptionSwitch,
  Segmented,
  ToolOptions,
  TransformTool,
  usePersistentState,
} from "@/components/tool";
import { indentChoices, prettierIndent, type Indent } from "@/tools/shared/indent";
import { prettierFormat, type PrintWidth, printWidthChoices } from "@/tools/shared/prettier";

type Mode = "beautify" | "minify";
const modeChoices: Choice<Mode>[] = [
  { value: "beautify", label: "Beautify" },
  { value: "minify", label: "Minify" },
];

/** Minifies with terser, which only understands JavaScript. */
async function minifyJs(code: string, typescript: boolean): Promise<string> {
  if (typescript) throw new Error("Minify works on JavaScript. Switch Language to JavaScript.");
  const { minify } = await import("terser");
  const result = await minify(code, { compress: true, mangle: true, module: true });
  return result.code ?? "";
}

type Syntax = "babel" | "typescript";

const syntaxChoices: Choice<Syntax>[] = [
  { value: "babel", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
];

const languages = {
  babel: javascript({ jsx: true }),
  typescript: javascript({ jsx: true, typescript: true }),
};

const sample = `import {useState} from "react"
type Props = {initial?: number}
export function Counter({initial = 0}: Props){const [count,setCount]=useState(initial)
return <button onClick={()=>setCount(c=>c+1)} className="counter">Clicked {count} times</button>}`;

export default function JsFormatterTool() {
  const [syntax, setSyntax] = usePersistentState<Syntax>("syntax", "typescript");
  const [indent, setIndent] = usePersistentState<Indent>("indent", "2");
  const [width, setWidth] = usePersistentState<PrintWidth>("printWidth", "100");
  const [semi, setSemi] = usePersistentState("semi", true);
  const [singleQuote, setSingleQuote] = usePersistentState("singleQuote", false);
  const [mode, setMode] = usePersistentState<Mode>("mode", "beautify");

  const transform = useCallback(
    (input: string) =>
      mode === "minify"
        ? minifyJs(input, syntax === "typescript")
        : prettierFormat(input, syntax, { ...prettierIndent(indent), printWidth: Number(width), semi, singleQuote }),
    [mode, syntax, indent, width, semi, singleQuote],
  );

  return (
    <TransformTool
      transform={transform}
      inputLanguage={languages[syntax]}
      sample={sample}
      placeholder="Paste code here"
      options={
        <ToolOptions>
          <Option label="Mode">
            <Segmented value={mode} onChange={setMode} choices={modeChoices} />
          </Option>
          <Option label="Language">
            <Segmented value={syntax} onChange={setSyntax} choices={syntaxChoices} />
          </Option>
          {mode === "beautify" && (
            <>
              <Option label="Indent">
                <Segmented value={indent} onChange={setIndent} choices={indentChoices} />
              </Option>
              <Option label="Width">
                <Segmented value={width} onChange={setWidth} choices={printWidthChoices} />
              </Option>
              <OptionSwitch label="Semicolons" checked={semi} onChange={setSemi} />
              <OptionSwitch label="Single quotes" checked={singleQuote} onChange={setSingleQuote} />
            </>
          )}
        </ToolOptions>
      }
    />
  );
}
