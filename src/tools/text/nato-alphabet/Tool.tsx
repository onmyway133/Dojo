import { type Choice, Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { fromNato, toNato } from "./logic";

type Mode = "spell" | "read";
const modeChoices: Choice<Mode>[] = [
  { value: "spell", label: "Text → Code Words" },
  { value: "read", label: "Code Words → Text" },
];

export default function NatoAlphabetTool() {
  const [mode, setMode] = usePersistentState<Mode>("mode", "spell");
  const spell = mode === "spell";

  return (
    <TransformTool
      transform={spell ? toNato : fromNato}
      inputTitle={spell ? "Text" : "Code Words"}
      outputTitle={spell ? "Code Words" : "Text"}
      sample={spell ? "Order 42B" : "Oscar Romeo Delta Echo Romeo / Four Two Bravo"}
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
