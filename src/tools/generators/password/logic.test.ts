import { expect, it } from "vitest";
import { entropyBits, generatePassword } from "./logic";

const base = { length: 20, upper: true, lower: true, digits: true, symbols: false, avoidAmbiguous: true };

it("uses every enabled set and respects length", () => {
  for (let i = 0; i < 50; i++) {
    const password = generatePassword(base);
    expect(password).toHaveLength(20);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).not.toMatch(/[Il1O0o]/);
  }
});

it("estimates entropy", () => {
  expect(entropyBits({ ...base, upper: false, lower: false, avoidAmbiguous: false, length: 10 })).toBeCloseTo(33.22, 1);
  expect(() => generatePassword({ ...base, upper: false, lower: false, digits: false })).toThrow();
});
