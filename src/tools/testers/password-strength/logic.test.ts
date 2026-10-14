import { expect, it } from "vitest";
import { analyzePassword, describeDuration } from "./logic";

it("flags common and patterned passwords", () => {
  const weak = analyzePassword("Password1");
  expect(weak.bits).toBeLessThanOrEqual(10);
  expect(weak.warnings).toContain("It's one of the most common passwords");
  expect(analyzePassword("abcd1111").warnings).toContain("Contains a keyboard or alphabet sequence");
  const seasonal = analyzePassword("Summer2024!");
  expect(seasonal.warnings).toEqual(expect.arrayContaining(['Contains the common word "summer"', "Contains a year (2024)"]));
  expect(seasonal.bits).toBeLessThan(50);
});

it("rates a long random password highly", () => {
  const report = analyzePassword("t7#Qm!v2Lr9@xK4p");
  expect(report.pool).toBe(95);
  expect(report.warnings).toEqual([]);
  expect(report.bits).toBeGreaterThan(100);
});

it("describes durations", () => {
  expect(describeDuration(0.2)).toBe("Instantly");
  expect(describeDuration(90)).toBe("2 minutes");
  expect(describeDuration(1e20)).toBe("More than a million years");
});
