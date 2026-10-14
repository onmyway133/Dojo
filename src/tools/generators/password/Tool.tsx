import { useMemo, useState } from "react";
import {
  type Choice,
  Option,
  OptionSwitch,
  Segmented,
  StatusMessage,
  ToolOptions,
  ToolPage,
  usePersistentState,
} from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { GeneratedList } from "@/tools/shared/GeneratedList";
import { strengthBadgeVariant, strengthLabel } from "@/tools/shared/strength";
import { entropyBits, generatePassword, type PasswordOptions } from "./logic";

type Count = "1" | "5" | "10";
const countChoices: Choice<Count>[] = ["1", "5", "10"].map((v) => ({ value: v as Count, label: v }));

export default function PasswordTool() {
  const [options, setOptions] = usePersistentState<PasswordOptions>("options", {
    length: 20,
    upper: true,
    lower: true,
    digits: true,
    symbols: true,
    avoidAmbiguous: false,
  });
  const [count, setCount] = usePersistentState<Count>("count", "5");
  const [seed, setSeed] = useState(0);
  const set = (patch: Partial<PasswordOptions>) => setOptions((o) => ({ ...o, ...patch }));

  const result = useMemo(() => {
    try {
      return { ok: true as const, values: Array.from({ length: Number(count) }, () => generatePassword(options)) };
    } catch (error) {
      return { ok: false as const, error: (error as Error).message };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, count, seed]);

  const bits = entropyBits(options);
  const strength = strengthLabel(bits);

  return (
    <ToolPage>
      <ToolOptions>
        <Option label={`Length ${options.length}`}>
          <Slider
            value={[options.length]}
            min={4}
            max={128}
            step={1}
            onValueChange={([length]) => set({ length })}
            className="w-44"
          />
        </Option>
        <Option label="Count">
          <Segmented value={count} onChange={setCount} choices={countChoices} />
        </Option>
        <OptionSwitch label="A–Z" checked={options.upper} onChange={(upper) => set({ upper })} />
        <OptionSwitch label="a–z" checked={options.lower} onChange={(lower) => set({ lower })} />
        <OptionSwitch label="0–9" checked={options.digits} onChange={(digits) => set({ digits })} />
        <OptionSwitch label="Symbols" checked={options.symbols} onChange={(symbols) => set({ symbols })} />
        <OptionSwitch label="Avoid look-alikes" checked={options.avoidAmbiguous} onChange={(avoidAmbiguous) => set({ avoidAmbiguous })} />
      </ToolOptions>
      {result.ok ? (
        <GeneratedList
          title="Passwords"
          meta={
            <span className="flex items-center gap-1.5">
              {Math.round(bits)} bits of entropy
              <Badge variant={strengthBadgeVariant(strength.tone)}>
                {strength.label}
              </Badge>
            </span>
          }
          values={result.values}
          onRegenerate={() => setSeed((s) => s + 1)}
        />
      ) : (
        <StatusMessage tone="error">{result.error}</StatusMessage>
      )}
    </ToolPage>
  );
}
