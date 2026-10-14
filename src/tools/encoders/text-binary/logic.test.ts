import { expect, it } from "vitest";
import { binaryToText, textToBinary } from "./logic";

it("round trips UTF-8 text", () => {
  expect(textToBinary("Hi")).toBe("01001000 01101001");
  expect(binaryToText(textToBinary("Crème ⚙️"))).toBe("Crème ⚙️");
  expect(() => binaryToText("0101")).toThrow();
});
