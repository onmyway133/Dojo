import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { useCallback } from "react";
import { type Choice, Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { jsonToXml, xmlToJson } from "./logic";

type Direction = "xml-to-json" | "json-to-xml";
const directionChoices: Choice<Direction>[] = [
  { value: "xml-to-json", label: "XML → JSON" },
  { value: "json-to-xml", label: "JSON → XML" },
];
const jsonLanguage = json();
const xmlLanguage = xml();

const sampleXml = `<catalog>
  <book id="bk101" lang="en">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <price>44.95</price>
  </book>
  <book id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <price>5.95</price>
  </book>
</catalog>`;
const sampleJson = `{
  "catalog": {
    "book": [
      { "@id": "bk101", "author": "Gambardella, Matthew", "title": "XML Developer's Guide", "price": 44.95 },
      { "@id": "bk102", "author": "Ralls, Kim", "title": "Midnight Rain", "price": 5.95 }
    ]
  }
}`;

export default function JsonXmlTool() {
  const [direction, setDirection] = usePersistentState<Direction>("direction", "xml-to-json");
  const toJson = direction === "xml-to-json";
  const transform = useCallback((input: string) => (toJson ? xmlToJson(input, 2) : jsonToXml(input, 2)), [toJson]);

  return (
    <TransformTool
      transform={transform}
      inputTitle={toJson ? "XML" : "JSON"}
      outputTitle={toJson ? "JSON" : "XML"}
      inputLanguage={toJson ? xmlLanguage : jsonLanguage}
      outputLanguage={toJson ? jsonLanguage : xmlLanguage}
      sample={toJson ? sampleXml : sampleJson}
      options={
        <ToolOptions>
          <Option label="Convert">
            <Segmented value={direction} onChange={setDirection} choices={directionChoices} />
          </Option>
          <span className="text-xs text-muted-foreground">Attributes map to keys starting with @</span>
        </ToolOptions>
      }
    />
  );
}
