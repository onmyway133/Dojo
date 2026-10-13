import { expect, it } from "vitest";
import { describeCron } from "./logic";

it("describes and schedules a cron expression", () => {
  const info = describeCron("0 9 * * 1-5", 2, new Date("2026-10-16T12:00:00"));
  expect(info.description).toBe("At 09:00, Monday through Friday");
  // Friday noon -> next runs are Monday and Tuesday 09:00 local time.
  expect(info.next.map((d) => d.getDay())).toEqual([1, 2]);
  expect(info.fields[1]).toEqual({ name: "Hour", value: "9" });
});

it("throws on invalid expressions", () => {
  expect(() => describeCron("61 * * * *", 1)).toThrow();
});
