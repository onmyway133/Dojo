import { expect, it } from "vitest";
import { parsePermissions, toOctal, toSymbolic } from "./logic";

it("converts between octal and symbolic", () => {
  const p = parsePermissions("0754")!;
  expect(toSymbolic(p)).toBe("rwxr-xr--");
  expect(toOctal(parsePermissions("rw-r--r--")!)).toBe("644");
  expect(parsePermissions("999")).toBeUndefined();
});
