import { expect, it } from "vitest";
import { colorFormats, contrastLevel, parseColor } from "./logic";

it("converts a hex color", () => {
  const color = parseColor("#0a84ff");
  if (!color) throw new Error("parse failed");
  const formats = colorFormats(color);
  expect(formats.rgb).toBe("rgb(10, 132, 255)");
  expect(formats.swiftUI).toBe("Color(red: 0.039, green: 0.518, blue: 1.000)");
  expect(formats.cmyk).toBe("cmyk(96%, 48%, 0%, 0%)");
  expect(contrastLevel(formats.contrastBlack)).not.toBe("Fail");
});

it("rejects unknown colors", () => {
  expect(parseColor("not a color")).toBeUndefined();
});
