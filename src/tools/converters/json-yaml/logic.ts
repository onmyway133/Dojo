import { parse, stringify } from "yaml";
import { parseJson } from "@/tools/shared/json";

export type Direction = "json-to-yaml" | "yaml-to-json";

export function jsonToYaml(input: string, indent: number): string {
  const parsed = parseJson(input);
  if (!parsed.ok) throw new Error(parsed.error);
  return stringify(parsed.value, { indent, lineWidth: 0 });
}

export function yamlToJson(input: string, indent: number): string {
  return JSON.stringify(parse(input), null, indent);
}
