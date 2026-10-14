import { CopyButton, ToolPage, ToolSection, usePersistentState } from "@/components/tool";
import { Input } from "@/components/ui/input";
import { formatNumber, parseNumber, percentChange, percentOf, whatPercent } from "./logic";

type Pair = [string, string];

function NumberInput({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode="decimal"
      aria-label={label}
      spellCheck={false}
      className="w-32 font-mono text-[14px]"
    />
  );
}

/** One calculation: a sentence with two inputs and its answer on the right. */
function Calculation({
  title,
  pair,
  onChange,
  words,
  compute,
  suffix = "",
  signed = false,
}: {
  title: string;
  pair: Pair;
  onChange: (pair: Pair) => void;
  words: [string, string, string];
  compute: (a: number, b: number) => number | undefined;
  suffix?: string;
  /** Show a + on increases. */
  signed?: boolean;
}) {
  const a = parseNumber(pair[0]);
  const b = parseNumber(pair[1]);
  const result = a !== undefined && b !== undefined ? formatNumber(compute(a, b)) : "";
  const shown = result ? `${signed && Number(result) > 0 ? "+" : ""}${result}${suffix}` : "";

  return (
    <ToolSection title={title} actions={<CopyButton value={shown} />}>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[14px]">
        {words[0] && <span className="text-muted-foreground">{words[0]}</span>}
        <NumberInput value={pair[0]} onChange={(v) => onChange([v, pair[1]])} label={`${title} first value`} />
        <span className="text-muted-foreground">{words[1]}</span>
        <NumberInput value={pair[1]} onChange={(v) => onChange([pair[0], v])} label={`${title} second value`} />
        <span className="text-muted-foreground">{words[2]}</span>
        <span className="ml-auto min-w-24 text-right text-2xl font-semibold tabular-nums select-text">{shown || "—"}</span>
      </div>
    </ToolSection>
  );
}

export default function PercentageTool() {
  const [of, setOf] = usePersistentState<Pair>("of", ["15", "80"]);
  const [what, setWhat] = usePersistentState<Pair>("what", ["30", "120"]);
  const [change, setChange] = usePersistentState<Pair>("change", ["80", "100"]);

  return (
    <ToolPage layout="scroll">
      <Calculation title="Percent of a Value" pair={of} onChange={setOf} words={["What is", "% of", "?"]} compute={percentOf} />
      <Calculation title="Share as a Percent" pair={what} onChange={setWhat} words={["", "is what % of", "?"]} compute={whatPercent} suffix="%" />
      <Calculation
        title="Percent Change"
        pair={change}
        onChange={setChange}
        words={["From", "to", ""]}
        compute={percentChange}
        suffix="%"
        signed
      />
    </ToolPage>
  );
}
