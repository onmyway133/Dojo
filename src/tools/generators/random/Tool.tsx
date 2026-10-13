import { Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import {
  type Choice,
  CodeEditor,
  CopyButton,
  InputActions,
  Option,
  OptionSelect,
  OptionSwitch,
  Segmented,
  SplitView,
  StatusMessage,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeneratedList } from "@/tools/shared/GeneratedList";
import { type Charset, randomIntegers, randomStrings, shuffleLines } from "./logic";

type Mode = "numbers" | "strings" | "shuffle";
const modeChoices: Choice<Mode>[] = [
  { value: "numbers", label: "Numbers" },
  { value: "strings", label: "Strings" },
  { value: "shuffle", label: "Shuffle List" },
];
const charsetChoices: Choice<Charset>[] = [
  { value: "alphanumeric", label: "Letters & digits" },
  { value: "letters", label: "Letters" },
  { value: "digits", label: "Digits" },
  { value: "hex", label: "Hex" },
  { value: "base64url", label: "Base64 URL" },
];

const NumberInput = ({ value, onChange, width = "w-24" }: { value: number; onChange: (n: number) => void; width?: string }) => (
  <Input type="number" value={value} onChange={(e) => onChange(Math.trunc(Number(e.target.value)))} className={`h-7 ${width} text-[13px]`} />
);

function attempt<T>(fn: () => T): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: fn() };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

function ShufflePanel({ seed, reshuffle }: { seed: number; reshuffle: () => void }) {
  const [list, setList] = usePersistentState("list", "Ada\nGrace\nLinus\nMargaret\nKen");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shuffled = useMemo(() => shuffleLines(list), [list, seed]);
  return (
    <SplitView>
      <ToolSection title="List" meta="One item per line" actions={<InputActions value={list} onChange={setList} />} fill padded={false}>
        <CodeEditor value={list} onChange={setList} lineNumbers={false} />
      </ToolSection>
      <ToolSection
        title="Shuffled"
        actions={
          <>
            <CopyButton value={shuffled} />
            <Button variant="ghost" size="sm" onClick={reshuffle}>
              <Shuffle /> Shuffle
            </Button>
          </>
        }
        fill
        padded={false}
      >
        <CodeEditor value={shuffled} readOnly />
      </ToolSection>
    </SplitView>
  );
}

export default function RandomTool() {
  const [mode, setMode] = usePersistentState<Mode>("mode", "numbers");
  const [min, setMin] = usePersistentState("min", 1);
  const [max, setMax] = usePersistentState("max", 100);
  const [count, setCount] = usePersistentState("count", 5);
  const [unique, setUnique] = usePersistentState("unique", false);
  const [length, setLength] = usePersistentState("length", 16);
  const [charset, setCharset] = usePersistentState<Charset>("charset", "alphanumeric");
  const [seed, setSeed] = useState(0);
  const regenerate = () => setSeed((s) => s + 1);
  const safeCount = Math.max(1, Math.min(1000, count));

  const result = useMemo(
    () =>
      attempt(() =>
        mode === "numbers"
          ? randomIntegers(Math.min(min, max), Math.max(min, max), safeCount, unique).map(String)
          : randomStrings(Math.max(1, Math.min(4096, length)), charset, safeCount),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, min, max, safeCount, unique, length, charset, seed],
  );

  return (
    <ToolPage>
      <ToolOptions>
        <Option label="Generate">
          <Segmented value={mode} onChange={setMode} choices={modeChoices} />
        </Option>
        {mode === "numbers" && (
          <>
            <Option label="From">
              <NumberInput value={min} onChange={setMin} />
            </Option>
            <Option label="To">
              <NumberInput value={max} onChange={setMax} />
            </Option>
            <OptionSwitch label="Unique" checked={unique} onChange={setUnique} />
          </>
        )}
        {mode === "strings" && (
          <>
            <Option label="Length">
              <NumberInput value={length} onChange={setLength} width="w-20" />
            </Option>
            <Option label="Characters">
              <OptionSelect value={charset} onChange={setCharset} choices={charsetChoices} />
            </Option>
          </>
        )}
        {mode !== "shuffle" && (
          <Option label="Count">
            <NumberInput value={count} onChange={setCount} width="w-20" />
          </Option>
        )}
      </ToolOptions>
      {mode === "shuffle" ? (
        <ShufflePanel seed={seed} reshuffle={regenerate} />
      ) : result.ok ? (
        <GeneratedList title={mode === "numbers" ? "Numbers" : "Strings"} values={result.value} onRegenerate={regenerate} />
      ) : (
        <StatusMessage tone="error">{result.error}</StatusMessage>
      )}
    </ToolPage>
  );
}
