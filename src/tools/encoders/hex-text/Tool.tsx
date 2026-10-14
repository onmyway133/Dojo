import { useCallback } from "react";
import { type Choice, Option, OptionSwitch, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { hexToText, type Separator, textToHex } from "./logic";

type Mode = "to-hex" | "to-text";
const modeChoices: Choice<Mode>[] = [
  { value: "to-hex", label: "Text → Hex" },
  { value: "to-text", label: "Hex → Text" },
];
const separatorChoices: Choice<Separator>[] = [
  { value: "space", label: "Space" },
  { value: "none", label: "None" },
  { value: "colon", label: "Colon" },
  { value: "0x", label: "0x, " },
];

export default function HexTextTool() {
  const [mode, setMode] = usePersistentState<Mode>("mode", "to-hex");
  const [separator, setSeparator] = usePersistentState<Separator>("separator", "space");
  const [uppercase, setUppercase] = usePersistentState("uppercase", false);
  const toHex = mode === "to-hex";

  const transform = useCallback(
    (input: string) => (toHex ? textToHex(input, separator, uppercase) : hexToText(input)),
    [toHex, separator, uppercase],
  );

  return (
    <TransformTool
      transform={transform}
      inputTitle={toHex ? "Text" : "Hex"}
      outputTitle={toHex ? "Hex" : "Text"}
      sample={toHex ? "Dojo ⚙️" : "44 6f 6a 6f"}
      options={
        <ToolOptions>
          <Option label="Convert">
            <Segmented value={mode} onChange={setMode} choices={modeChoices} />
          </Option>
          {toHex && (
            <>
              <Option label="Separator">
                <Segmented value={separator} onChange={setSeparator} choices={separatorChoices} />
              </Option>
              <OptionSwitch label="Uppercase" checked={uppercase} onChange={setUppercase} />
            </>
          )}
        </ToolOptions>
      }
    />
  );
}
