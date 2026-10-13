import { expect, it } from "vitest";
import { fromCodePoints, inspect } from "./logic";

it("inspects code points", () => {
  const [a, wave] = inspect("é👋");
  expect(a).toMatchObject({ label: "U+00E9", utf8: "C3 A9", utf16: "00E9", js: "\\u00E9", html: "&#xE9;" });
  expect(wave).toMatchObject({ label: "U+1F44B", utf8: "F0 9F 91 8B", utf16: "D83D DC4B", js: "\\u{1F44B}" });
});

it("parses many notations back to text", () => {
  expect(fromCodePoints("U+0048 \\u0069 &#x1F44B; &#33;")).toBe("Hi👋!");
  expect(fromCodePoints("\\uD83D\\uDC4B")).toBe("👋");
  expect(() => fromCodePoints("zzz")).toThrow();
});
