import { expect, it } from "vitest";
import { convert, formatValue } from "./logic";
import { categories } from "./units";

const find = (id: string) => categories.flatMap((c) => c.units).find((u) => u.id === id)!;

it("converts linear and offset units", () => {
  expect(formatValue(convert(1, find("mile"), find("km")))).toBe("1.609344");
  expect(formatValue(convert(100, find("degC"), find("degF")))).toBe("212");
  expect(formatValue(convert(10, find("kn"), find("km/h")))).toBe("18.52");
  expect(formatValue(convert(1, find("kcal"), find("kJ")))).toBe("4.184");
  expect(formatValue(convert(1, find("GiB"), find("MB")))).toBe("1073.741824");
});

it("each category's default unit exists", () => {
  for (const c of categories) expect(c.units.some((u) => u.id === c.defaultFrom)).toBe(true);
});

it("every unit converts to the first unit of its category", () => {
  for (const c of categories) for (const u of c.units) expect(Number.isFinite(convert(1, u, c.units[0]))).toBe(true);
});
