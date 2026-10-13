import { expect, it } from "vitest";
import { sniffImageType } from "./image";

it("sniffs common image types", () => {
  expect(sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d]))).toBe("image/png");
  expect(sniffImageType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBe("image/svg+xml");
  expect(sniffImageType(new Uint8Array([1, 2, 3]))).toBeUndefined();
});
