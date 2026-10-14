import { parse } from "culori";
import { expect, it } from "vitest";
import { harmonies } from "./logic";

it("rotates hues around the wheel", () => {
  const byId = Object.fromEntries(harmonies(parse("#ff0000")!).map((h) => [h.id, h.colors]));
  expect(byId.complementary).toEqual(["#ff0000", "#00ffff"]);
  expect(byId.triadic).toEqual(["#ff0000", "#00ff00", "#0000ff"]);
  expect(byId.monochromatic).toHaveLength(5);
  expect(byId.monochromatic[2]).toBe("#ff0000");
});
