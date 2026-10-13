import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";
import { parseJson } from "@/tools/shared/json";

/** Attributes appear as keys starting with "@" in JSON, text next to them as "#text". */
const options = { ignoreAttributes: false, attributeNamePrefix: "@", textNodeName: "#text" };

export function xmlToJson(xml: string, indent: number): string {
  const valid = XMLValidator.validate(xml);
  if (valid !== true) throw new Error(`${valid.err.msg} at line ${valid.err.line}, column ${valid.err.col}`);
  const value = new XMLParser({ ...options, parseTagValue: true }).parse(xml);
  return JSON.stringify(value, null, indent);
}

/** XML needs a single root element, so anything else is wrapped in <root>. */
export function jsonToXml(json: string, indent: number): string {
  const parsed = parseJson(json);
  if (!parsed.ok) throw new Error(parsed.error);
  let value = parsed.value;
  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  const keys = isObject ? Object.keys(value as object).filter((k) => !k.startsWith("?")) : [];
  if (!isObject || keys.length !== 1) value = { root: Array.isArray(value) ? { item: value } : value };
  const builder = new XMLBuilder({ ...options, format: true, indentBy: " ".repeat(indent), suppressEmptyNode: true });
  return builder.build(value).trim();
}
