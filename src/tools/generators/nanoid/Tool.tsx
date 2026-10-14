import { type ReactNode, useMemo, useState } from "react";
import {
  type Choice,
  Option,
  OptionSelect,
  Segmented,
  StatusMessage,
  ToolOptions,
  ToolPage,
  usePersistentState,
} from "@/components/tool";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { GeneratedList } from "@/tools/shared/GeneratedList";
import { type AlphabetId, alphabets, idsForOnePercentCollision, nanoid } from "./logic";

type AlphabetChoice = AlphabetId | "custom";
const alphabetChoices: Choice<AlphabetChoice>[] = [
  { value: "default", label: "URL-safe (A–Z a–z 0–9 _ -)" },
  { value: "alphanumeric", label: "Alphanumeric" },
  { value: "lowercase", label: "Lowercase + digits" },
  { value: "numbers", label: "Digits" },
  { value: "nolookalikes", label: "No look-alikes" },
  { value: "custom", label: "Custom" },
];
type Count = "1" | "5" | "10" | "50";
const countChoices: Choice<Count>[] = ["1", "5", "10", "50"].map((v) => ({ value: v as Count, label: v }));
const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });

/** Compact up to trillions, then scientific notation such as 1.3 × 10¹⁸. */
function approximate(n: number): ReactNode {
  if (n < 1e12) return compact.format(n);
  const [mantissa, exponent] = n.toExponential(1).split("e");
  return (
    <>
      {mantissa} × 10<sup>{Number(exponent)}</sup>
    </>
  );
}

export default function NanoIdTool() {
  const [size, setSize] = usePersistentState("size", 21);
  const [alphabetId, setAlphabetId] = usePersistentState<AlphabetChoice>("alphabet", "default");
  const [custom, setCustom] = usePersistentState("custom", "abcdef0123456789");
  const [count, setCount] = usePersistentState<Count>("count", "5");
  const [seed, setSeed] = useState(0);
  const alphabet = alphabetId === "custom" ? [...new Set(custom)].join("") : alphabets[alphabetId];

  const result = useMemo(() => {
    try {
      return { values: Array.from({ length: Number(count) }, () => nanoid(size, alphabet)) };
    } catch (error) {
      return { error: (error as Error).message };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, alphabet, count, seed]);

  const safeCount = idsForOnePercentCollision(size, [...alphabet].length);

  return (
    <ToolPage>
      <ToolOptions>
        <Option label={`Size ${size}`}>
          <Slider value={[size]} min={4} max={64} step={1} onValueChange={([v]) => setSize(v)} className="w-40" />
        </Option>
        <Option label="Alphabet">
          <OptionSelect value={alphabetId} onChange={setAlphabetId} choices={alphabetChoices} className="min-w-52" />
        </Option>
        {alphabetId === "custom" && (
          <Input value={custom} onChange={(e) => setCustom(e.target.value)} spellCheck={false} className="h-7 w-56 font-mono text-[13px]" />
        )}
        <Option label="Count">
          <Segmented value={count} onChange={setCount} choices={countChoices} />
        </Option>
      </ToolOptions>
      {result.values ? (
        <GeneratedList
          title="IDs"
          meta={Number.isFinite(safeCount) && safeCount > 1 ? <>About {approximate(safeCount)} IDs before a 1% chance of a collision</> : undefined}
          values={result.values}
          onRegenerate={() => setSeed((s) => s + 1)}
        />
      ) : (
        <StatusMessage tone="error">{result.error}</StatusMessage>
      )}
    </ToolPage>
  );
}
