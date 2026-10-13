import { yaml } from "@codemirror/lang-yaml";
import { useCallback } from "react";
import { type Choice, Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { formatYaml } from "./logic";

const language = yaml();

type YamlIndent = "2" | "4";
const indentChoices: Choice<YamlIndent>[] = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
];

const sample = `services:
    web:
        image: "nginx:1.27"
        ports: ["8080:80"]
        environment:
            - MODE=production   # deploy target
    db:
        image: postgres:17
`;

export default function YamlFormatterTool() {
  const [indent, setIndent] = usePersistentState<YamlIndent>("indent", "2");
  const transform = useCallback((input: string) => formatYaml(input, Number(indent)), [indent]);

  return (
    <TransformTool
      transform={transform}
      inputLanguage={language}
      sample={sample}
      placeholder="Paste YAML here"
      options={
        <ToolOptions>
          <Option label="Indent">
            <Segmented value={indent} onChange={setIndent} choices={indentChoices} />
          </Option>
        </ToolOptions>
      }
    />
  );
}
