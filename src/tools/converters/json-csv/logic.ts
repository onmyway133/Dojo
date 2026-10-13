import Papa from "papaparse";
import { parseJson } from "@/tools/shared/json";

export type Direction = "json-to-csv" | "csv-to-json";
export type Delimiter = "," | ";" | "\t" | "|";

export interface Table {
  columns: string[];
  rows: string[][];
}

/** Flattens nested objects into dot paths: { a: { b: 1 } } -> { "a.b": 1 }. Arrays stay JSON. */
export function flatten(value: unknown, prefix = "", out: Record<string, unknown> = {}): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out);
    }
  } else {
    out[prefix || "value"] = value;
  }
  return out;
}

const cell = (value: unknown) =>
  value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);

/** JSON array (or single object) to a table with the union of all keys as columns. */
export function jsonToTable(input: string): Table {
  const parsed = parseJson(input);
  if (!parsed.ok) throw new Error(parsed.error);
  const items = Array.isArray(parsed.value) ? parsed.value : [parsed.value];
  const flat = items.map((item) => flatten(item));
  const columns = [...new Set(flat.flatMap((row) => Object.keys(row)))];
  return { columns, rows: flat.map((row) => columns.map((c) => cell(row[c]))) };
}

export function tableToCsv(table: Table, delimiter: Delimiter): string {
  return Papa.unparse({ fields: table.columns, data: table.rows }, { delimiter, newline: "\n" });
}

export function csvToTable(input: string, delimiter: Delimiter): Table {
  const result = Papa.parse<string[]>(input.trim(), { delimiter, skipEmptyLines: true });
  if (result.errors.length > 0) {
    const error = result.errors[0];
    throw new Error(`${error.message}${error.row !== undefined ? ` (row ${error.row + 1})` : ""}`);
  }
  const [columns = [], ...rows] = result.data;
  return { columns, rows };
}

/** Numbers and booleans become JSON values when the whole cell is one. */
function typed(text: string): unknown {
  if (text === "") return null;
  if (text === "true" || text === "false") return text === "true";
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(text) && Number.isFinite(Number(text))) return Number(text);
  return text;
}

export function tableToJson(table: Table, inferTypes: boolean): string {
  const objects = table.rows.map((row) =>
    Object.fromEntries(table.columns.map((column, i) => [column, inferTypes ? typed(row[i] ?? "") : (row[i] ?? "")])),
  );
  return JSON.stringify(objects, null, 2);
}
