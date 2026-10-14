import { useMemo } from "react";
import { type Choice, Option, OptionSelect, ResultList, ResultRow, StatusMessage, ToolOptions, ToolPage, ToolSection, usePersistentState } from "@/components/tool";
import { Input } from "@/components/ui/input";
import { convert, formatValue } from "./logic";
import { categories } from "./units";

const categoryChoices: Choice<string>[] = categories.map((c) => ({ value: c.id, label: c.name }));

export default function UnitConverterTool() {
  const [categoryId, setCategoryId] = usePersistentState("category", "length");
  const [fromByCategory, setFromByCategory] = usePersistentState<Record<string, string>>("from", {});
  const [input, setInput] = usePersistentState("value", "1");

  const category = categories.find((c) => c.id === categoryId) ?? categories[0];
  const from =
    category.units.find((u) => u.id === (fromByCategory[category.id] ?? category.defaultFrom)) ?? category.units[0];
  const unitChoices = useMemo(() => category.units.map((u) => ({ value: u.id, label: `${u.label} (${u.symbol})` })), [category]);

  const value = input.trim() === "" ? undefined : Number(input.replace(/[\s_,]/g, ""));
  const valid = value !== undefined && Number.isFinite(value);

  return (
    <ToolPage layout="scroll">
      <ToolOptions>
        <Option label="Category">
          <OptionSelect value={category.id} onChange={setCategoryId} choices={categoryChoices} className="min-w-36" />
        </Option>
        <Option label="Value">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            inputMode="decimal"
            spellCheck={false}
            aria-invalid={(value !== undefined && !valid) || undefined}
            className="h-7 w-40 font-mono text-[13px]"
          />
        </Option>
        <Option label="From">
          <OptionSelect
            value={from.id}
            onChange={(id) => setFromByCategory((m) => ({ ...m, [category.id]: id }))}
            choices={unitChoices}
            className="min-w-52"
          />
        </Option>
      </ToolOptions>

      {value !== undefined && !valid && <StatusMessage tone="error">Not a number</StatusMessage>}

      {valid && (
        <ToolSection title={category.name} meta={`${formatValue(value)} ${from.symbol}`}>
          <ResultList>
            {category.units.map((to) => {
              const result = formatValue(convert(value, from, to));
              return (
                <ResultRow
                  key={to.id}
                  label={to.label}
                  value={result}
                  mono
                  className={to.id === from.id ? "font-semibold" : undefined}
                  display={
                    <>
                      {result} <span className="text-muted-foreground">{to.symbol}</span>
                    </>
                  }
                />
              );
            })}
          </ResultList>
        </ToolSection>
      )}
    </ToolPage>
  );
}
