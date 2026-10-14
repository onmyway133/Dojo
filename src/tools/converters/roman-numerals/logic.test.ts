import { expect, it } from "vitest";
import { fromRoman, toRoman } from "./logic";

it("converts both ways and rejects invalid numerals", () => {
  expect(toRoman(2026)).toBe("MMXXVI");
  expect(toRoman(3999)).toBe("MMMCMXCIX");
  expect(fromRoman("mcmxciv")).toBe(1994);
  expect(() => fromRoman("IIII")).toThrow();
  expect(() => toRoman(0)).toThrow();
});
