import { type Choice, Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { binaryToText, textToBinary } from "./logic";

type Mode = "to-binary" | "to-text";
const modeChoices: Choice<Mode>[] = [
  { value: "to-binary", label: "Text → Binary" },
  { value: "to-text", label: "Binary → Text" },
];

export default function TextBinaryTool() {
  const [mode, setMode] = usePersistentState<Mode>("mode", "to-binary");
  const toBinary = mode === "to-binary";

  return (
    <TransformTool
      transform={toBinary ? textToBinary : binaryToText}
      inputTitle={toBinary ? "Text" : "Binary"}
      outputTitle={toBinary ? "Binary" : "Text"}
      sample={toBinary ? "DevTools" : "01000100 01100101 01110110"}
      options={
        <ToolOptions>
          <Option label="Convert">
            <Segmented value={mode} onChange={setMode} choices={modeChoices} />
          </Option>
        </ToolOptions>
      }
    />
  );
}
