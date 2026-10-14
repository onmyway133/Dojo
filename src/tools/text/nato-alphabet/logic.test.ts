import { expect, it } from "vitest";
import { fromNato, toNato } from "./logic";

it("spells and reads back", () => {
  expect(toNato("ab 12!")).toBe("Alfa Bravo / One Two !");
  expect(fromNato("Alpha Bravo / One Two")).toBe("AB 12");
});
