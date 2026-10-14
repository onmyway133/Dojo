import { expect, it } from "vitest";
import { formatNumber, parseNumber, percentChange, percentOf, whatPercent } from "./logic";

it("calculates percentages", () => {
  expect(formatNumber(percentOf(15, 80))).toBe("12");
  expect(formatNumber(whatPercent(30, 120))).toBe("25");
  expect(formatNumber(percentChange(80, 100))).toBe("25");
  expect(formatNumber(percentChange(-50, -25))).toBe("50");
  expect(whatPercent(1, 0)).toBeUndefined();
  expect(parseNumber("1,250.5 %")).toBe(1250.5);
  expect(parseNumber("12abc")).toBeUndefined();
});
