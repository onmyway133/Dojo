import { expect, it } from "vitest";
import { cheatsheet, filterCheatsheet, insertAt } from "./syntax";

it("every pattern token is valid JavaScript regex syntax", () => {
  for (const g of cheatsheet.filter((g) => g.target === "pattern")) {
    for (const t of g.tokens) expect(() => new RegExp(t.token.includes("\\k<") ? `(?<name>a)${t.token}` : `(a)${t.token}`, "u")).not.toThrow();
  }
});

it("filters tokens and inserts at the caret", () => {
  expect(filterCheatsheet(cheatsheet, "lookbehind")).toEqual([]);
  expect(filterCheatsheet(cheatsheet, "preceded").flatMap((g) => g.tokens.map((t) => t.token))).toEqual(["(?<=abc)", "(?<!abc)"]);
  expect(insertAt("ab", "\\d", 1, 1)).toEqual({ text: "a\\db", caret: 3 });
  expect(insertAt("abc", "x", 0, 3)).toEqual({ text: "x", caret: 1 });
});
