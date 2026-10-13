import { expect, it } from "vitest";
import { hexToText, textToHex } from "./logic";

it("round trips text and hex", () => {
  expect(textToHex("Hi é", "space", false)).toBe("48 69 20 c3 a9");
  expect(textToHex("Hi", "0x", true)).toBe("0x48, 0x69");
  expect(hexToText("0x48, 0x69:20 c3a9")).toBe("Hi é");
  expect(() => hexToText("abc")).toThrow();
});
