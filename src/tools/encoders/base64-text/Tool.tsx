import { useCallback } from "react";
import { type Choice, Option, OptionSwitch, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { decodeBase64Text, encodeBase64Text } from "@/tools/shared/base64";

type Mode = "encode" | "decode";
const modeChoices: Choice<Mode>[] = [
  { value: "encode", label: "Encode" },
  { value: "decode", label: "Decode" },
];

export default function Base64TextTool() {
  const [mode, setMode] = usePersistentState<Mode>("mode", "encode");
  const [urlSafe, setUrlSafe] = usePersistentState("urlSafe", false);
  const encode = mode === "encode";
  const transform = useCallback(
    (input: string) => (encode ? encodeBase64Text(input, urlSafe) : decodeBase64Text(input)),
    [encode, urlSafe],
  );

  return (
    <TransformTool
      transform={transform}
      inputTitle={encode ? "Text" : "Base64"}
      outputTitle={encode ? "Base64" : "Text"}
      sample={encode ? "Hello, Dojo 👋" : "SGVsbG8sIERvam8g8J+Riw=="}
      options={
        <ToolOptions>
          <Option label="Mode">
            <Segmented value={mode} onChange={setMode} choices={modeChoices} />
          </Option>
          {encode && <OptionSwitch label="URL-safe" checked={urlSafe} onChange={setUrlSafe} />}
        </ToolOptions>
      }
    />
  );
}
