import { expect, it } from "vitest";
import { formatYaml } from "./logic";

it("re-indents multiple documents", () => {
  expect(formatYaml("a:\n    b: 1\n---\nc: [1, 2]\n", 2)).toBe("a:\n  b: 1\n---\nc: [ 1, 2 ]\n");
});

it("throws on invalid yaml", () => {
  expect(() => formatYaml("a: [1, 2", 2)).toThrow();
});
