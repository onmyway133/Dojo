import { expect, it } from "vitest";
import { childPath, matchingPaths } from "./logic";

it("builds accessor paths", () => {
  expect(childPath("$", "owner")).toBe("$.owner");
  expect(childPath("$.tags", 0)).toBe("$.tags[0]");
  expect(childPath("$", "a b")).toBe('$["a b"]');
});

it("keeps ancestors of matches", () => {
  const paths = matchingPaths({ owner: { login: "jane" }, id: 1 }, "jan");
  expect([...paths].sort()).toEqual(["$", "$.owner", "$.owner.login"]);
});
