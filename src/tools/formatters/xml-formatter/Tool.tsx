import { xml } from "@codemirror/lang-xml";
import { useCallback } from "react";
import { Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { indentChoices } from "@/tools/shared/indent";
import { formatXmlText, sampleXml, type XmlStyle } from "./logic";

const language = xml();
const styleChoices = [...indentChoices, { value: "minify" as const, label: "Minify" }];

export default function XmlFormatterTool() {
  const [style, setStyle] = usePersistentState<XmlStyle>("style", "2");
  const transform = useCallback((input: string) => formatXmlText(input, style), [style]);

  return (
    <TransformTool
      transform={transform}
      inputLanguage={language}
      sample={sampleXml}
      placeholder="Paste XML here"
      options={
        <ToolOptions>
          <Option label="Indent">
            <Segmented value={style} onChange={setStyle} choices={styleChoices} />
          </Option>
        </ToolOptions>
      }
    />
  );
}
