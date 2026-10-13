import { expect, it } from "vitest";
import { compareLists } from "./logic";

it("compares with case and whitespace options", () => {
  const result = compareLists("apple\n Banana\ncherry\napple", "banana\ndate\nCherry", { ignoreCase: true, trim: true });
  expect(result).toEqual({ onlyA: ["apple"], onlyB: ["date"], both: ["Banana", "cherry"] });
  expect(compareLists("A", "a", { ignoreCase: false, trim: true }).both).toEqual([]);
});
