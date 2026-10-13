import { expect, it } from "vitest";
import { allUnits, convertSize, formatAmount } from "./logic";

const unit = (id: string) => allUnits.find((u) => u.id === id)!;

it("converts between decimal and binary units", () => {
  expect(convertSize(1, unit("GiB"), unit("MB"))).toBeCloseTo(1073.741824);
  expect(formatAmount(convertSize(1500, unit("KB"), unit("MB")))).toBe("1.5");
  expect(convertSize(1, unit("B"), unit("bit"))).toBe(8);
});
