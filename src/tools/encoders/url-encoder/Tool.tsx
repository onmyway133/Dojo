import { useCallback } from "react";
import { type Choice, Option, OptionSwitch, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { transformUrl, type UrlMode } from "./logic";

const modeChoices: Choice<UrlMode>[] = [
  { value: "component", label: "Encode value" },
  { value: "uri", label: "Encode URL" },
  { value: "decode", label: "Decode" },
];

export default function UrlEncoderTool() {
  const [mode, setMode] = usePersistentState<UrlMode>("mode", "component");
  const [plus, setPlus] = usePersistentState("plusForSpace", false);
  const transform = useCallback((input: string) => transformUrl(input, mode, plus), [mode, plus]);

  return (
    <TransformTool
      transform={transform}
      sample={mode === "decode" ? "q%3Dswift%20ui%26lang%3Den" : "q=swift ui&lang=en"}
      options={
        <ToolOptions>
          <Option label="Mode">
            <Segmented value={mode} onChange={setMode} choices={modeChoices} />
          </Option>
          <OptionSwitch label="Spaces as +" checked={plus} onChange={setPlus} />
        </ToolOptions>
      }
    />
  );
}
