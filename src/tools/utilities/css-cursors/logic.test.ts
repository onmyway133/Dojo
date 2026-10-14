import { expect, it } from "vitest";
import { cursorGroups } from "./data";
import { filterCursors } from "./logic";

it("lists all 36 cursor keywords once", () => {
  const values = cursorGroups.flatMap((g) => g.cursors.map((c) => c.value));
  expect(values).toHaveLength(36);
  expect(new Set(values).size).toBe(36);
});

it("filters by value and description", () => {
  expect(filterCursors(cursorGroups, "zoom").flatMap((g) => g.cursors.map((c) => c.value))).toEqual(["zoom-in", "zoom-out"]);
  expect(filterCursors(cursorGroups, "clickable").map((g) => g.name)).toEqual(["Links and status"]);
});
