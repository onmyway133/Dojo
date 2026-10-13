import { expect, it } from "vitest";
import { transformUrl } from "./logic";

it("encodes and decodes", () => {
  expect(transformUrl("a b&c=é", "component", false)).toBe("a%20b%26c%3D%C3%A9");
  expect(transformUrl("a b", "component", true)).toBe("a+b");
  expect(transformUrl("https://x.dev/a b?q=1", "uri", false)).toBe("https://x.dev/a%20b?q=1");
  expect(transformUrl("a+b%26", "decode", true)).toBe("a b&");
  expect(() => transformUrl("%E0%A4%A", "decode", false)).toThrow();
});
