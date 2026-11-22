import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import { Plus, RefreshCw, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  type Choice,
  CodeEditor,
  CopyButton,
  IconAction,
  Option,
  OptionSelect,
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
import { useDebounced } from "@/hooks/useDebounced";
import { type FakeDataOptions, type Field, type OutputFormat, defaultOptions, fieldTypes, generate, MAX_ROWS } from "./logic";

const jsonLanguage = json();
const sqlLanguage = sql();
const formats: Choice<OutputFormat>[] = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
  { value: "sql", label: "SQL" },
];
const typeChoices: Choice<string>[] = fieldTypes.map((t) => ({ value: t.id, label: t.label }));
const rangeTypes = new Set(fieldTypes.filter((t) => t.range).map((t) => t.id));

function run(options: FakeDataOptions) {
  try {
    return { output: generate(options) };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export default function FakeDataTool() {
  const [options, setOptions] = usePersistentState<FakeDataOptions>("options", defaultOptions);
  const [round, setRound] = useState(0);
  const set = (patch: Partial<FakeDataOptions>) => setOptions((o) => ({ ...o, ...patch }));
  const setField = (index: number, patch: Partial<Field>) =>
    set({ fields: options.fields.map((f, i) => (i === index ? { ...f, ...patch } : f)) });
  const number = (text: string) => (text.trim() === "" || Number.isNaN(Number(text)) ? undefined : Number(text));

  const debounced = useDebounced(options, 150);
  // `round` re-rolls unseeded data.
  const result = useMemo(() => run(debounced), [debounced, round]);

  return (
    <ToolPage>
      <ToolOptions>
        <Option label="Rows">
          <Input
            type="number"
            min={1}
            max={MAX_ROWS}
            value={options.rows}
            onChange={(e) => set({ rows: Number(e.target.value) })}
            className="w-24"
          />
        </Option>
        <Option label="Format">
          <Segmented value={options.format} onChange={(format) => set({ format })} choices={formats} />
        </Option>
        {options.format === "sql" && (
          <Option label="Table">
            <Input value={options.table} onChange={(e) => set({ table: e.target.value })} spellCheck={false} className="w-32 font-mono text-[13px]" />
          </Option>
        )}
        <Option label="Seed">
          <Input value={options.seed} onChange={(e) => set({ seed: e.target.value })} placeholder="Random" spellCheck={false} className="w-28" />
        </Option>
        <Button variant="toolbar" size="sm" onClick={() => setRound((r) => r + 1)} disabled={Boolean(options.seed.trim())}>
          <RefreshCw /> Regenerate
        </Button>
      </ToolOptions>
      <SplitView>
        <ToolSection
          title="Fields"
          meta={`${options.fields.length}`}
          actions={
            <Button variant="ghost" size="sm" onClick={() => set({ fields: [...options.fields, { name: `field_${options.fields.length + 1}`, type: "word" }] })}>
              <Plus /> Add
            </Button>
          }
          fill
        >
          <div className="flex min-h-0 flex-col gap-1.5 overflow-y-auto">
            {options.fields.map((field, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <Input
                  value={field.name}
                  onChange={(e) => setField(index, { name: e.target.value })}
                  spellCheck={false}
                  className="w-36 font-mono text-[13px]"
                  aria-label="Field name"
                />
                <OptionSelect value={field.type} onChange={(type) => setField(index, { type })} choices={typeChoices} className="w-40" />
                {rangeTypes.has(field.type) && (
                  <>
                    <Input value={field.min ?? ""} onChange={(e) => setField(index, { min: number(e.target.value) })} placeholder="Min 0" className="w-20" aria-label="Minimum" />
                    <Input value={field.max ?? ""} onChange={(e) => setField(index, { max: number(e.target.value) })} placeholder="Max 100" className="w-20" aria-label="Maximum" />
                  </>
                )}
                <div className="flex-1" />
                <IconAction label="Remove" onClick={() => set({ fields: options.fields.filter((_, i) => i !== index) })}>
                  <X />
                </IconAction>
              </div>
            ))}
          </div>
        </ToolSection>
        <ToolSection title="Output" actions={<CopyButton value={result.output ?? ""} />} fill padded={false}>
          {result.error ? (
            <StatusMessage tone="error" className="mx-4">
              {result.error}
            </StatusMessage>
          ) : (
            <CodeEditor
              value={result.output ?? ""}
              language={options.format === "json" ? jsonLanguage : options.format === "sql" ? sqlLanguage : undefined}
              readOnly
            />
          )}
        </ToolSection>
      </SplitView>
    </ToolPage>
  );
}
