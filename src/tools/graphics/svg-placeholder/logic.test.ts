import { expect, it } from "vitest";
import { placeholderSvg, svgDataUri } from "./logic";

it("builds an escaped SVG and a data URI", () => {
  const svg = placeholderSvg({ width: 300, height: 150, background: "#ddd", foreground: "#555", text: "<Hero>", fontSize: 24 });
  expect(svg).toContain('width="300" height="150"');
  expect(svg).toContain("&lt;Hero&gt;");
  expect(svgDataUri(svg).startsWith("data:image/svg+xml,%3Csvg xmlns=")).toBe(true);
});
