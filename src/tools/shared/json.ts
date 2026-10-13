import { type ParseError, parse, printParseErrorCode } from "jsonc-parser";
import { positionAt } from "./text";

export type JsonParseResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

/**
 * Strict JSON parse with a readable error that includes line and column,
 * which the WebKit JSON.parse message does not.
 */
export function parseJson(text: string): JsonParseResult {
  const errors: ParseError[] = [];
  parse(text, errors, { allowTrailingComma: false, disallowComments: true });
  if (errors.length > 0) {
    const first = errors[0];
    const { line, column } = positionAt(text, first.offset);
    return { ok: false, error: `${humanize(printParseErrorCode(first.error))} at line ${line}, column ${column}` };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// "PropertyNameExpected" -> "Property name expected"
function humanize(code: string): string {
  const words = code.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Deep copy with object keys sorted alphabetically. Arrays keep their order. */
export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeysDeep((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

export const sampleJson = `{
  "id": 1024,
  "name": "DevTools",
  "active": true,
  "rating": 4.8,
  "tags": ["json", "formatter", "macOS"],
  "owner": { "login": "khoa", "url": "https://github.com/onmyway133" },
  "releases": [
    { "version": "1.0.0", "date": "2026-10-13T09:30:00Z", "notes": null },
    { "version": "1.1.0", "date": "2026-11-02T12:00:00Z", "notes": "Dark mode" }
  ]
}`;
