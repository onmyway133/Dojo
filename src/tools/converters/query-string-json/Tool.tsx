import { json } from "@codemirror/lang-json";
import { useCallback } from "react";
import { type Choice, Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { type Direction, jsonToQuery, queryToJson } from "./logic";

const jsonLanguage = json();
const directionChoices: Choice<Direction>[] = [
  { value: "query-to-json", label: "Query → JSON" },
  { value: "json-to-query", label: "JSON → Query" },
];

const sampleQuery = "https://example.com/search?q=swift%20concurrency&tag=ios&tag=macos&page=2";
const sampleJson = `{
  "q": "swift concurrency",
  "tag": ["ios", "macos"],
  "page": 2
}
`;

export default function QueryStringJsonTool() {
  const [direction, setDirection] = usePersistentState<Direction>("direction", "query-to-json");
  const toJson = direction === "query-to-json";
  const transform = useCallback((input: string) => (toJson ? queryToJson(input) : jsonToQuery(input)), [toJson]);

  return (
    <TransformTool
      transform={transform}
      inputTitle={toJson ? "Query String" : "JSON"}
      outputTitle={toJson ? "JSON" : "Query String"}
      inputLanguage={toJson ? undefined : jsonLanguage}
      outputLanguage={toJson ? jsonLanguage : undefined}
      sample={toJson ? sampleQuery : sampleJson}
      placeholder={toJson ? "a=1&b=2, ?a=1, or a full URL" : "Paste a JSON object"}
      options={
        <ToolOptions>
          <Option label="Convert">
            <Segmented value={direction} onChange={setDirection} choices={directionChoices} />
          </Option>
        </ToolOptions>
      }
    />
  );
}
