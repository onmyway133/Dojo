import {
  FieldList,
  FieldRow,
  OptionSelect,
  ResultList,
  ResultRow,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Input } from "@/components/ui/input";
import { allUnits, binaryUnits, bitUnit, convertSize, decimalUnits, formatAmount, type SizeUnit } from "./logic";

const unitChoices = allUnits.map((u) => ({ value: u.id, label: `${u.id} · ${u.name}` }));

export default function DataSizeTool() {
  const [amountText, setAmountText] = usePersistentState("amount", "1");
  const [unitId, setUnitId] = usePersistentState("unit", "GB");

  const from = allUnits.find((u) => u.id === unitId) ?? decimalUnits[3];
  const amount = Number(amountText.replace(/[,_\s]/g, ""));
  const valid = amountText.trim() !== "" && Number.isFinite(amount);

  const row = (unit: SizeUnit) => {
    const value = valid ? formatAmount(convertSize(amount, from, unit)) : "";
    return <ResultRow key={unit.id} label={`${unit.name} (${unit.id})`} value={value} mono />;
  };

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Amount">
        <FieldList>
          <FieldRow label="Size" hint={!valid && amountText.trim() ? "Enter a number" : undefined} error>
            <Input
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              inputMode="decimal"
              className="font-mono text-[13px]"
            />
            <OptionSelect value={unitId} onChange={setUnitId} choices={unitChoices} className="h-8 w-48" />
          </FieldRow>
        </FieldList>
      </ToolSection>
      <div className="grid gap-4 @3xl:grid-cols-2">
        <ToolSection title="Decimal" meta="Powers of 1000">
          <ResultList>
            {row(bitUnit)}
            {decimalUnits.map(row)}
          </ResultList>
        </ToolSection>
        <ToolSection title="Binary" meta="Powers of 1024">
          <ResultList>{binaryUnits.map(row)}</ResultList>
        </ToolSection>
      </div>
    </ToolPage>
  );
}
