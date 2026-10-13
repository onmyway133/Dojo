import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { useCallback } from "react";
import { type Choice, Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { sampleJson } from "@/tools/shared/json";
import { type Direction, jsonToYaml, yamlToJson } from "./logic";

const jsonLanguage = json();
const yamlLanguage = yaml();

const directionChoices: Choice<Direction>[] = [
  { value: "json-to-yaml", label: "JSON → YAML" },
  { value: "yaml-to-json", label: "YAML → JSON" },
];
const indentChoices: Choice<"2" | "4">[] = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
];

const sampleYaml = `name: DevTools
version: 1.2.0
platforms: [macOS]
features:
  - name: Formatters
    count: 9
  - name: Converters
    count: 10
`;

export default function JsonYamlTool() {
  const [direction, setDirection] = usePersistentState<Direction>("direction", "json-to-yaml");
  const [indent, setIndent] = usePersistentState<"2" | "4">("indent", "2");
  const toYaml = direction === "json-to-yaml";

  const transform = useCallback(
    (input: string) => (toYaml ? jsonToYaml(input, Number(indent)) : yamlToJson(input, Number(indent))),
    [toYaml, indent],
  );

  return (
    <TransformTool
      transform={transform}
      inputTitle={toYaml ? "JSON" : "YAML"}
      outputTitle={toYaml ? "YAML" : "JSON"}
      inputLanguage={toYaml ? jsonLanguage : yamlLanguage}
      outputLanguage={toYaml ? yamlLanguage : jsonLanguage}
      sample={toYaml ? sampleJson : sampleYaml}
      options={
        <ToolOptions>
          <Option label="Convert">
            <Segmented value={direction} onChange={setDirection} choices={directionChoices} />
          </Option>
          <Option label="Indent">
            <Segmented value={indent} onChange={setIndent} choices={indentChoices} />
          </Option>
        </ToolOptions>
      }
    />
  );
}
