import { html } from "@codemirror/lang-html";
import { useCallback } from "react";
import { Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { indentChoices, prettierIndent, type Indent } from "@/tools/shared/indent";
import { prettierFormat, type PrintWidth, printWidthChoices } from "@/tools/shared/prettier";

const language = html();

const sample = `<!doctype html><html><head><title>DevTools</title><style>body{margin:0;font-family:system-ui}</style></head><body><nav class="sidebar"><ul><li><a href="#/">All Tools</a></li><li><a href="#/tools/json-formatter">JSON</a></li></ul></nav><main><h1>Hello</h1><p>Formatted with <strong>prettier</strong>.</p></main><script>document.querySelector("h1").addEventListener("click",()=>alert("hi"))</script></body></html>`;

export default function HtmlFormatterTool() {
  const [indent, setIndent] = usePersistentState<Indent>("indent", "2");
  const [width, setWidth] = usePersistentState<PrintWidth>("printWidth", "100");

  const transform = useCallback(
    (input: string) => prettierFormat(input, "html", { ...prettierIndent(indent), printWidth: Number(width) }),
    [indent, width],
  );

  return (
    <TransformTool
      transform={transform}
      inputLanguage={language}
      sample={sample}
      placeholder="Paste HTML here"
      options={
        <ToolOptions>
          <Option label="Indent">
            <Segmented value={indent} onChange={setIndent} choices={indentChoices} />
          </Option>
          <Option label="Line width">
            <Segmented value={width} onChange={setWidth} choices={printWidthChoices} />
          </Option>
        </ToolOptions>
      }
    />
  );
}
