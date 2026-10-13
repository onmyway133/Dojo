import { expect, it } from "vitest";
import { analyze, formatMinutes } from "./logic";

it("counts text statistics", () => {
  const stats = analyze("Hello world. Hello again!\n\nNew paragraph 👋");
  expect(stats.words).toBe(6);
  expect(stats.sentences).toBe(3);
  expect(stats.paragraphs).toBe(2);
  expect(stats.lines).toBe(3);
  expect(stats.topWords[0]).toEqual(["hello", 2]);
  expect(analyze("👋").characters).toBe(1);
  expect(formatMinutes(1.5)).toBe("1 min 30 sec");
});
