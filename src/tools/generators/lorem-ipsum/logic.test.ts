import { expect, it } from "vitest";
import { lorem } from "./logic";

it("produces the requested amount", () => {
  expect(lorem("words", 7, true).split(" ")).toHaveLength(7);
  expect(lorem("words", 3, true)).toBe("Lorem ipsum dolor");
  expect(lorem("paragraphs", 3, false).split("\n\n")).toHaveLength(3);
  expect(lorem("sentences", 2, true)).toMatch(/^Lorem ipsum dolor sit amet, /);
});
