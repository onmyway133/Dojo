import { indentString, type Indent } from "@/tools/shared/indent";
import { parseJson, sortKeysDeep } from "@/tools/shared/json";

export type JsonStyle = Indent | "minify";

export interface FormatOptions {
  style: JsonStyle;
  sortKeys: boolean;
}

export type FormatResult = { ok: true; output: string } | { ok: false; error: string };

export function formatJson(input: string, { style, sortKeys }: FormatOptions): FormatResult {
  if (!input.trim()) return { ok: true, output: "" };
  const parsed = parseJson(input);
  if (!parsed.ok) return parsed;
  const value = sortKeys ? sortKeysDeep(parsed.value) : parsed.value;
  const space = style === "minify" ? undefined : indentString(style);
  return { ok: true, output: JSON.stringify(value, null, space) };
}
