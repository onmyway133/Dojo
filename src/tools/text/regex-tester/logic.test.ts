import { expect, it } from "vitest";
import { captureNames, findMatches, replaceAll } from "./logic";

it("finds matches with groups", () => {
  const result = findMatches("(?<user>\\w+)@(\\w+)\\.com", "g", "a@b.com, cat@dog.com");
  expect(result.ok && result.matches.map((m) => [m.text, m.groups[1], m.named?.user])).toEqual([
    ["a@b.com", "b", "a"],
    ["cat@dog.com", "dog", "cat"],
  ]);
  expect(findMatches("x*", "g", "ab").ok).toBe(true); // zero-length matches terminate
  expect(findMatches("(", "g", "").ok).toBe(false);
  expect(replaceAll("(\\d+)", "g", "a1b22", "[$1]")).toBe("a[1]b[22]");
});

it("names capture groups by position", () => {
  expect(captureNames("(?<a>x)(?:y)(z)[(](?<b>\\()")).toEqual(["a", undefined, "b"]);
});
