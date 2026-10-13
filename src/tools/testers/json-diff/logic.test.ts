import { expect, it } from "vitest";
import { diffJson } from "./logic";

it("finds added, removed and changed paths", () => {
  const changes = diffJson({ a: 1, b: { c: [1, 2] }, d: "x" }, { a: 2, b: { c: [1] }, e: true });
  expect(changes).toEqual([
    { kind: "changed", path: "$.a", before: 1, after: 2 },
    { kind: "removed", path: "$.b.c[1]", before: 2 },
    { kind: "removed", path: "$.d", before: "x" },
    { kind: "added", path: "$.e", after: true },
  ]);
  expect(diffJson({ x: [1, { y: 2 }] }, { x: [1, { y: 2 }] })).toEqual([]);
});
