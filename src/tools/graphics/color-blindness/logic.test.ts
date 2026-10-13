import { expect, it } from "vitest";
import { colorMatrixValues, simulations } from "./logic";

it("keeps white white and builds 20 matrix values", () => {
  for (const { matrix } of simulations) {
    for (let row = 0; row < 3; row++) {
      expect(matrix[row * 3] + matrix[row * 3 + 1] + matrix[row * 3 + 2]).toBeCloseTo(1, 2);
    }
  }
  expect(colorMatrixValues(simulations[0].matrix).split(" ")).toHaveLength(20);
});
