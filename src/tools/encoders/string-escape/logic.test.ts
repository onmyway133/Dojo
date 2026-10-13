import { expect, it } from "vitest";
import { escapeString, unescapeString } from "./logic";

it("escapes and unescapes", () => {
  const text = 'line "one"\n\ttab é 👋';
  expect(escapeString(text, "double", false)).toBe('line \\"one\\"\\n\\ttab é 👋');
  expect(escapeString("é👋", "double", true)).toBe("\\u00e9\\ud83d\\udc4b");
  expect(unescapeString(escapeString(text, "double", true))).toBe(text);
  expect(unescapeString("\\x41\\u{1F44B}\\q")).toBe("A👋q");
});
