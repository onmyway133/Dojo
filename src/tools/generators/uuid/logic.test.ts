import { expect, it } from "vitest";
import { generateUuids, inspectUuid } from "./logic";

it("generates formatted uuids", () => {
  const [id] = generateUuids("v4", 1, { uppercase: true, hyphens: false });
  expect(id).toMatch(/^[0-9A-F]{32}$/);
});

it("reads v7 timestamps", () => {
  const before = Date.now();
  const [id] = generateUuids("v7", 1, { uppercase: false, hyphens: true });
  const info = inspectUuid(id)!;
  expect(info.version).toBe(7);
  expect(info.variant).toBe("RFC 9562");
  expect(Math.abs(info.timestamp!.getTime() - before)).toBeLessThan(5000);
  expect(inspectUuid("nope")).toBeUndefined();
});
