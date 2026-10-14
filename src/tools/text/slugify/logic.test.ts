import { expect, it } from "vitest";
import { slugify } from "./logic";

it("makes URL slugs", () => {
  expect(slugify("  Hello, World! Crème Brûlée & Tea ", "-", true)).toBe("hello-world-creme-brulee-and-tea");
  expect(slugify("Đà Nẵng 2026", "_", false)).toBe("Da_Nang_2026");
});
