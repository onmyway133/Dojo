import { useCallback } from "react";
import { type Choice, Option, OptionSwitch, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { bytesToText, decodeBase32, decodeBase58, encodeBase32, encodeBase58 } from "./logic";

type Mode = "encode" | "decode";
type Format = "base32" | "base58";

const modeChoices: Choice<Mode>[] = [
  { value: "encode", label: "Encode" },
  { value: "decode", label: "Decode" },
];
const formatChoices: Choice<Format>[] = [
  { value: "base32", label: "Base32" },
  { value: "base58", label: "Base58" },
];

const samples: Record<Format, string> = { base32: "JBSWY3DPEBCG62TP", base58: "2NEpo7TZRRrLZSi2U" };

export default function Base32And58Tool() {
  const [mode, setMode] = usePersistentState<Mode>("mode", "encode");
  const [format, setFormat] = usePersistentState<Format>("format", "base32");
  const [padding, setPadding] = usePersistentState("padding", true);
  const encode = mode === "encode";
  const name = format === "base32" ? "Base32" : "Base58";

  const transform = useCallback(
    (input: string) => {
      if (encode) {
        const bytes = new TextEncoder().encode(input);
        return format === "base32" ? encodeBase32(bytes, padding) : encodeBase58(bytes);
      }
      return bytesToText(format === "base32" ? decodeBase32(input) : decodeBase58(input));
    },
    [encode, format, padding],
  );

  return (
    <TransformTool
      transform={transform}
      inputTitle={encode ? "Text" : name}
      outputTitle={encode ? name : "Text"}
      sample={encode ? "Hello World!" : samples[format]}
      options={
        <ToolOptions>
          <Option label="Mode">
            <Segmented value={mode} onChange={setMode} choices={modeChoices} />
          </Option>
          <Option label="Format">
            <Segmented value={format} onChange={setFormat} choices={formatChoices} />
          </Option>
          {encode && format === "base32" && <OptionSwitch label="Padding" checked={padding} onChange={setPadding} />}
        </ToolOptions>
      }
    />
  );
}
