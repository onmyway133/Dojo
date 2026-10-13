import { expect, it } from "vitest";
import { formatBigInt, parseBigInt } from "./logic";

it("parses prefixes and separators", () => {
  expect(parseBigInt("0xFF_FF", 16)).toBe(65535n);
  expect(parseBigInt("-1 0000", 2)).toBe(-16n);
  expect(() => parseBigInt("129", 8)).toThrow(/base 8/);
});

it("handles numbers beyond 2^53 and grouping", () => {
  const big = parseBigInt("18446744073709551615", 10);
  expect(formatBigInt(big, 16)).toBe("ffffffffffffffff");
  expect(formatBigInt(1234567n, 10, true)).toBe("1,234,567");
  expect(formatBigInt(0b101101n, 2, true)).toBe("10 1101");
});
