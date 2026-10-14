import { parse } from "culori";
import { expect, it } from "vitest";
import { exportScale, tintsAndShades } from "./logic";

it("mixes linearly toward white and black", () => {
  const scale = tintsAndShades(parse("#808080")!, 1, "rgb");
  expect(scale.map((s) => s.hex)).toEqual(["#c0c0c0", "#808080", "#404040"]);
  expect(scale.map((s) => `${s.kind} ${s.percent}`)).toEqual(["tint 50", "base 0", "shade 50"]);
});

it("keeps OKLCH steps in gamut and exports CSS variables", () => {
  const scale = tintsAndShades(parse("#0a84ff")!, 3, "oklch");
  expect(scale).toHaveLength(7);
  expect(scale.every((s) => /^#[0-9a-f]{6}$/.test(s.hex))).toBe(true);
  expect(exportScale(scale.slice(2, 5), "css", "brand")).toBe(
    `:root {\n  --brand-tint-25: ${scale[2].hex};\n  --brand-base: #0a84ff;\n  --brand-shade-25: ${scale[4].hex};\n}`,
  );
});
