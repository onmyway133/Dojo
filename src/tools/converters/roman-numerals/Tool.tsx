import { CopyButton, FieldList, FieldRow, ToolPage, ToolSection, usePersistentState } from "@/components/tool";
import { Input } from "@/components/ui/input";
import { fromRoman, toRoman } from "./logic";

function attempt<T>(fn: () => T): { value?: T; error?: string } {
  try {
    return { value: fn() };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export default function RomanNumeralsTool() {
  // One source of truth: whichever field was typed in last.
  const [source, setSource] = usePersistentState<{ from: "number" | "roman"; text: string }>("source", {
    from: "number",
    text: "2026",
  });
  const fromNumber = source.from === "number";
  const result = source.text.trim()
    ? fromNumber
      ? attempt(() => toRoman(Number(source.text.trim())))
      : attempt(() => String(fromRoman(source.text)))
    : {};
  const numberText = fromNumber ? source.text : (result.value ?? "");
  const romanText = fromNumber ? (result.value ?? "") : source.text;

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Convert">
        <FieldList>
          <FieldRow label="Number" hint={fromNumber ? result.error : undefined} error>
            <Input
              value={numberText}
              onChange={(e) => setSource({ from: "number", text: e.target.value })}
              inputMode="numeric"
              placeholder="1 to 3999"
              spellCheck={false}
              className="max-w-64 font-mono text-[14px]"
            />
            <CopyButton value={numberText} />
          </FieldRow>
          <FieldRow label="Roman numeral" hint={!fromNumber ? result.error : undefined} error>
            <Input
              value={romanText}
              onChange={(e) => setSource({ from: "roman", text: e.target.value })}
              placeholder="MMXXVI"
              spellCheck={false}
              className="max-w-64 font-mono text-[14px] uppercase"
            />
            <CopyButton value={romanText} />
          </FieldRow>
        </FieldList>
      </ToolSection>
    </ToolPage>
  );
}
