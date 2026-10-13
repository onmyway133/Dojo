import { expect, it } from "vitest";
import { describeDate, parseDateInput } from "./logic";

it("detects timestamp units by magnitude", () => {
  const seconds = parseDateInput("1760000000");
  const millis = parseDateInput("1760000000000");
  expect(seconds.ok && seconds.detected).toBe("Unix seconds");
  expect(millis.ok && millis.detected).toBe("Unix milliseconds");
  expect(seconds.ok && millis.ok && seconds.date.getTime() === millis.date.getTime()).toBe(true);
  expect(parseDateInput("not a date").ok).toBe(false);
});

it("formats in a time zone", () => {
  const parsed = parseDateInput("2026-01-15T12:00:00Z");
  if (!parsed.ok) throw new Error("parse failed");
  const info = describeDate(parsed.date, "Asia/Tokyo", new Date("2026-01-15T13:00:00Z"));
  expect(info.isoZone).toBe("2026-01-15T21:00:00.000+09:00");
  expect(info.unixSeconds).toBe("1768478400");
  expect(info.relative).toBe("1 hour ago");
});
