import { expect, it } from "vitest";
import { secureInt, secureShuffle, secureString } from "./random";

it("stays in range and uses only the alphabet", () => {
  for (let i = 0; i < 500; i++) {
    const n = secureInt(-3, 3);
    expect(n).toBeGreaterThanOrEqual(-3);
    expect(n).toBeLessThanOrEqual(3);
  }
  expect(secureString(64, "ab")).toMatch(/^[ab]{64}$/);
  expect(secureShuffle([1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
  expect(() => secureString(4, "")).toThrow();
});
