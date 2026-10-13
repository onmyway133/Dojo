import { expect, it } from "vitest";
import { type LineOptions, transformLines } from "./logic";

const none: LineOptions = { trim: false, removeEmpty: false, dedupe: false, ignoreCase: false, sort: "none", reverse: false, prefix: "", suffix: "" };

it("dedupes, sorts naturally and wraps", () => {
  const out = transformLines("file10\n file2\n\nFile2\nfile1", { ...none, trim: true, removeEmpty: true, dedupe: true, ignoreCase: true, sort: "natural", prefix: "- ", suffix: ";" });
  expect(out).toBe("- file1;\n- file2;\n- file10;");
  expect(transformLines("b\na", { ...none, sort: "asc", reverse: true })).toBe("b\na");
});
