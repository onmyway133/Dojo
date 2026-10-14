import { unit } from "mathjs";
import type { UnitDef } from "./units";

/** Converts `value` from one unit to another. Units must share a dimension. */
export function convert(value: number, from: UnitDef, to: UnitDef): number {
  const quantity = unit(value * (from.factor ?? 1), from.mathjs);
  return quantity.toNumber(to.mathjs) / (to.factor ?? 1);
}

/** Up to 10 significant digits, exponent notation for very large or small values. */
export function formatValue(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e15 || abs < 1e-7) return value.toExponential(6).replace(/\.?0+e/, "e");
  return String(Number(value.toPrecision(10)));
}
