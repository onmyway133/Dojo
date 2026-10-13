import { expect, it } from "vitest";
import { evaluateLines } from "./logic";

it("evaluates lines with variables, units and errors", () => {
  const lines = evaluateLines("price = 120\ntax = 25%\nprice * (1 + tax)\n0.1 + 0.2\n5 cm to inch\n# note\n2 +");
  expect(lines.map((l) => l.result)).toEqual(["120", "0.25", "150", "0.3", "1.9685039370079 inch", undefined, undefined]);
  expect(lines[6].error).toBeTruthy();
});
