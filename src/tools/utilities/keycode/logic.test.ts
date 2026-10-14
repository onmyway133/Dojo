import { expect, it } from "vitest";
import { type KeyInfo, matchSnippet, shortcutLabel } from "./logic";

const press = (patch: Partial<KeyInfo>): KeyInfo => ({
  key: "k", code: "KeyK", keyCode: 75, location: 0, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, repeat: false, ...patch,
});

it("labels shortcuts the macOS way", () => {
  expect(shortcutLabel(press({ metaKey: true, shiftKey: true }))).toBe("⇧⌘K");
  expect(shortcutLabel(press({ key: "˚", altKey: true }))).toBe("⌥K");
  expect(shortcutLabel(press({ key: "ArrowUp", code: "ArrowUp" }))).toBe("↑");
  expect(matchSnippet(press({ metaKey: true }))).toContain('event.code === "KeyK" && event.metaKey');
});
