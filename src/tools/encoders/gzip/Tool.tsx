import { useCallback } from "react";
import { type Choice, Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { call } from "@/lib/invoke";

type Mode = "compress" | "decompress";
const modeChoices: Choice<Mode>[] = [
  { value: "compress", label: "Compress" },
  { value: "decompress", label: "Decompress" },
];
type Level = "1" | "6" | "9";
const levelChoices: Choice<Level>[] = [
  { value: "1", label: "Fast" },
  { value: "6", label: "Default" },
  { value: "9", label: "Best" },
];

export default function GzipTool() {
  const [mode, setMode] = usePersistentState<Mode>("mode", "compress");
  const [level, setLevel] = usePersistentState<Level>("level", "6");
  const compress = mode === "compress";

  const transform = useCallback(
    (input: string) =>
      compress
        ? call<string>("gzip_compress", { text: input, level: Number(level) })
        : call<string>("gzip_decompress", { base64: input }),
    [compress, level],
  );

  return (
    <TransformTool
      transform={transform}
      inputTitle={compress ? "Text" : "Base64 GZIP"}
      outputTitle={compress ? "Base64 GZIP" : "Text"}
      sample={compress ? '{"message":"hello","items":[1,2,3,4,5,6,7,8,9,10]}'.repeat(4) : "H4sIAAAAAAAAA8tIzcnJBwCGphA2BQAAAA=="}
      options={
        <ToolOptions>
          <Option label="Mode">
            <Segmented value={mode} onChange={setMode} choices={modeChoices} />
          </Option>
          {compress && (
            <Option label="Level">
              <Segmented value={level} onChange={setLevel} choices={levelChoices} />
            </Option>
          )}
        </ToolOptions>
      }
    />
  );
}
