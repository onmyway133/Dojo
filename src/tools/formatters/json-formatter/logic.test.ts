import { describe, expect, it } from "vitest";
import { formatJson } from "./logic";

describe("formatJson", () => {
  it("minifies and sorts keys", () => {
    expect(formatJson('{ "b": 1, "a": [2, {"d": 0, "c": 1}] }', { style: "minify", sortKeys: true })).toEqual({
      ok: true,
      output: '{"a":[2,{"c":1,"d":0}],"b":1}',
    });
  });

  it("reports the position of a syntax error", () => {
    const result = formatJson('{\n  "a": 1,\n}', { style: "2", sortKeys: false });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/line 3, column 1/);
  });
});
