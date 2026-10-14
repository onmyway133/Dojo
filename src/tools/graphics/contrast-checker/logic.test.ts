import { parse } from "culori";
import { expect, it } from "vitest";
import { contrastChecks, contrastRatio } from "./logic";

it("computes the WCAG ratio", () => {
  expect(contrastRatio(parse("#000")!, parse("#fff")!)).toBeCloseTo(21, 5);
  expect(contrastRatio(parse("#777")!, parse("#fff")!)).toBeCloseTo(4.48, 2);
  expect(contrastChecks(4.48).filter((c) => c.pass).map((c) => c.label)).toEqual(["AA large text", "AA UI components"]);
});

it("blends a translucent foreground over the background", () => {
  expect(contrastRatio(parse("rgb(0 0 0 / 0)")!, parse("#fff")!)).toBeCloseTo(1, 5);
});
