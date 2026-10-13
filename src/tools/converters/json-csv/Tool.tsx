import { json } from "@codemirror/lang-json";
import { useDeferredValue, useMemo } from "react";
import {
  type Choice,
  CodeEditor,
  CopyButton,
  InputActions,
  Option,
  OptionSwitch,
  Segmented,
  SplitView,
  StatusMessage,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { describeText } from "@/tools/shared/text";
import { DataTable } from "./DataTable";
import { csvToTable, type Delimiter, type Direction, jsonToTable, type Table, tableToCsv, tableToJson } from "./logic";

const jsonLanguage = json();

const directionChoices: Choice<Direction>[] = [
  { value: "json-to-csv", label: "JSON → CSV" },
  { value: "csv-to-json", label: "CSV → JSON" },
];
const delimiterChoices: Choice<Delimiter>[] = [
  { value: ",", label: "Comma" },
  { value: ";", label: "Semicolon" },
  { value: "\t", label: "Tab" },
  { value: "|", label: "Pipe" },
];
type View = "text" | "table";
const viewChoices: Choice<View>[] = [
  { value: "text", label: "Text" },
  { value: "table", label: "Table" },
];

const sampleJsonArray = `[
  { "id": 1, "name": "Ada", "role": "admin", "address": { "city": "London" } },
  { "id": 2, "name": "Linus", "role": "dev", "address": { "city": "Portland" } },
  { "id": 3, "name": "Grace", "role": "dev", "address": { "city": "Arlington" } }
]`;
const sampleCsv = "id,name,role\n1,Ada,admin\n2,Linus,dev\n3,Grace,dev";

type Result = { ok: true; table: Table; output: string } | { ok: false; error: string };

export default function JsonCsvTool() {
  const [input, setInput] = usePersistentState("input", "");
  const [direction, setDirection] = usePersistentState<Direction>("direction", "json-to-csv");
  const [delimiter, setDelimiter] = usePersistentState<Delimiter>("delimiter", ",");
  const [inferTypes, setInferTypes] = usePersistentState("inferTypes", true);
  const [view, setView] = usePersistentState<View>("view", "text");
  const toCsv = direction === "json-to-csv";

  const deferredInput = useDeferredValue(input);
  const result = useMemo<Result | undefined>(() => {
    if (!deferredInput.trim()) return undefined;
    try {
      if (toCsv) {
        const table = jsonToTable(deferredInput);
        return { ok: true, table, output: tableToCsv(table, delimiter) };
      }
      const table = csvToTable(deferredInput, delimiter);
      return { ok: true, table, output: tableToJson(table, inferTypes) };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }, [deferredInput, toCsv, delimiter, inferTypes]);

  const output = result?.ok ? result.output : "";

  return (
    <ToolPage>
      <ToolOptions>
        <Option label="Convert">
          <Segmented value={direction} onChange={setDirection} choices={directionChoices} />
        </Option>
        <Option label="Delimiter">
          <Segmented value={delimiter} onChange={setDelimiter} choices={delimiterChoices} />
        </Option>
        {!toCsv && <OptionSwitch label="Detect numbers" checked={inferTypes} onChange={setInferTypes} />}
      </ToolOptions>
      <SplitView>
        <ToolSection
          title={toCsv ? "JSON" : "CSV"}
          meta={describeText(input)}
          actions={<InputActions value={input} onChange={setInput} sample={toCsv ? sampleJsonArray : sampleCsv} />}
          fill
          padded={false}
        >
          <CodeEditor value={input} onChange={setInput} language={toCsv ? jsonLanguage : undefined} />
        </ToolSection>
        <ToolSection
          title={toCsv ? "CSV" : "JSON"}
          meta={result?.ok ? `${result.table.rows.length} rows · ${result.table.columns.length} columns` : undefined}
          actions={
            <>
              <Segmented value={view} onChange={setView} choices={viewChoices} className="mr-1" />
              <CopyButton value={output} />
            </>
          }
          fill
          padded={false}
        >
          {result && !result.ok ? (
            <StatusMessage tone="error" className="mx-4">
              {result.error}
            </StatusMessage>
          ) : view === "table" && result?.ok ? (
            <DataTable table={result.table} />
          ) : (
            <CodeEditor value={output} language={toCsv ? undefined : jsonLanguage} readOnly />
          )}
        </ToolSection>
      </SplitView>
    </ToolPage>
  );
}
