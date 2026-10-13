import { useMemo } from "react";
import {
  CopyButton,
  FieldList,
  FieldRow,
  OptionSwitch,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Input } from "@/components/ui/input";
import { formatBigInt, parseBigInt } from "./logic";

const fixedBases = [
  { base: 2, label: "Binary" },
  { base: 8, label: "Octal" },
  { base: 10, label: "Decimal" },
  { base: 16, label: "Hexadecimal" },
];

/** Which field the user typed in and what they typed; every other field is derived. */
interface Source {
  base: number;
  text: string;
}

export default function NumberBaseTool() {
  const [source, setSource] = usePersistentState<Source>("source", { base: 10, text: "255" });
  const [customBase, setCustomBase] = usePersistentState("customBase", 36);
  const [group, setGroup] = usePersistentState("group", false);
  const [uppercase, setUppercase] = usePersistentState("uppercase", true);

  const parsed = useMemo(() => {
    if (!source.text.trim()) return { value: undefined, error: undefined };
    try {
      return { value: parseBigInt(source.text, source.base), error: undefined };
    } catch (error) {
      return { value: undefined, error: (error as Error).message };
    }
  }, [source]);

  const bases = [...fixedBases, { base: customBase, label: `Base ${customBase}` }];

  function display(base: number): string {
    if (base === source.base) return source.text;
    if (parsed.value === undefined) return "";
    const text = formatBigInt(parsed.value, base, group);
    return uppercase ? text.toUpperCase() : text;
  }

  return (
    <ToolPage layout="scroll">
      <ToolOptions>
        <OptionSwitch label="Group digits" checked={group} onChange={setGroup} />
        <OptionSwitch label="Uppercase" checked={uppercase} onChange={setUppercase} />
      </ToolOptions>
      <ToolSection title="Value" meta="Edit any field">
        <FieldList>
          {bases.map(({ base, label }, index) => {
            const isCustom = index === bases.length - 1;
            const value = display(base);
            const showError = parsed.error && base === source.base;
            return (
              <FieldRow
                key={isCustom ? "custom" : base}
                label={
                  isCustom ? (
                    <span className="flex items-center gap-1.5">
                      Base
                      <Input
                        type="number"
                        min={2}
                        max={36}
                        value={customBase}
                        onChange={(e) => setCustomBase(Math.min(36, Math.max(2, Number(e.target.value) || 2)))}
                        className="h-6 w-14 px-1.5 text-[12px]"
                      />
                    </span>
                  ) : (
                    label
                  )
                }
                hint={showError ? parsed.error : undefined}
                error={Boolean(showError)}
              >
                <Input
                  value={value}
                  onChange={(e) => setSource({ base, text: e.target.value })}
                  spellCheck={false}
                  aria-invalid={showError ? true : undefined}
                  className="font-mono text-[13px]"
                />
                <CopyButton value={value} />
              </FieldRow>
            );
          })}
        </FieldList>
      </ToolSection>
    </ToolPage>
  );
}
