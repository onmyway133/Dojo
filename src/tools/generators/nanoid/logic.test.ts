import { expect, it } from "vitest";
import { alphabets, nanoid } from "./logic";

it("uses only the alphabet and the requested size", () => {
  const id = nanoid(21, alphabets.default);
  expect(id).toHaveLength(21);
  expect(/^[A-Za-z0-9_-]+$/.test(id)).toBe(true);
  expect(/^[0-9]{8}$/.test(nanoid(8, alphabets.numbers))).toBe(true);
});

it("default alphabet is 64 distinct URL-safe characters", () => {
  expect(new Set(alphabets.default).size).toBe(64);
});
