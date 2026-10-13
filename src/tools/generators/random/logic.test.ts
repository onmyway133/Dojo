import { expect, it } from "vitest";
import { randomIntegers, randomStrings, shuffleLines } from "./logic";

it("generates unique integers in range", () => {
  const values = randomIntegers(1, 6, 6, true);
  expect([...values].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  expect(() => randomIntegers(1, 3, 4, true)).toThrow();
  expect(randomStrings(8, "hex", 2).every((s) => /^[0-9a-f]{8}$/.test(s))).toBe(true);
  expect(shuffleLines("a\n\nb\nc").split("\n").sort()).toEqual(["a", "b", "c"]);
});
