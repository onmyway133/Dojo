import { json } from "@codemirror/lang-json";
import { StreamLanguage } from "@codemirror/language";
import { toml } from "@codemirror/legacy-modes/mode/toml";
import { useCallback } from "react";
import { type Choice, Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { sampleJson } from "@/tools/shared/json";
import { jsonToToml, tomlToJson } from "./api";

const jsonLanguage = json();
const tomlLanguage = StreamLanguage.define(toml);

type Direction = "json-to-toml" | "toml-to-json";
const directionChoices: Choice<Direction>[] = [
  { value: "json-to-toml", label: "JSON → TOML" },
  { value: "toml-to-json", label: "TOML → JSON" },
];

const sampleToml = `[package]
name = "devtools"
version = "0.1.0"
edition = "2024"

[dependencies]
serde = { version = "1", features = ["derive"] }
tauri = "2"
`;

export default function JsonTomlTool() {
  const [direction, setDirection] = usePersistentState<Direction>("direction", "toml-to-json");
  const toToml = direction === "json-to-toml";
  const transform = useCallback((input: string) => (toToml ? jsonToToml(input) : tomlToJson(input, 2)), [toToml]);

  return (
    <TransformTool
      transform={transform}
      inputTitle={toToml ? "JSON" : "TOML"}
      outputTitle={toToml ? "TOML" : "JSON"}
      inputLanguage={toToml ? jsonLanguage : tomlLanguage}
      outputLanguage={toToml ? tomlLanguage : jsonLanguage}
      sample={toToml ? sampleJson.replace(/"notes": null/g, '"notes": ""') : sampleToml}
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
