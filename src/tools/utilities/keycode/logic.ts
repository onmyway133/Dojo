export interface KeyInfo {
  key: string;
  code: string;
  keyCode: number;
  location: number;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  repeat: boolean;
}

export function keyInfo(event: KeyboardEvent): KeyInfo {
  const { key, code, keyCode, location, metaKey, ctrlKey, altKey, shiftKey, repeat } = event;
  return { key, code, keyCode, location, metaKey, ctrlKey, altKey, shiftKey, repeat };
}

const locations = ["Standard", "Left", "Right", "Numpad"];
export const locationName = (location: number) => locations[location] ?? String(location);

/** macOS-style shortcut label, e.g. ⌃⌥⇧⌘K. Modifier keys pressed alone show just their symbol. */
export function shortcutLabel(info: KeyInfo): string {
  const mods = [info.ctrlKey && "⌃", info.altKey && "⌥", info.shiftKey && "⇧", info.metaKey && "⌘"].filter(Boolean).join("");
  if (["Meta", "Control", "Alt", "Shift"].includes(info.key)) return mods;
  const names: Record<string, string> = {
    " ": "Space", Enter: "↩", Escape: "⎋", Backspace: "⌫", Delete: "⌦", Tab: "⇥",
    ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
  };
  // With ⌥ the key is the typed character (å), so name the physical key from `code` instead.
  const base = info.code.startsWith("Key") ? info.code.slice(3) : info.code.startsWith("Digit") ? info.code.slice(5) : (names[info.key] ?? (info.key.length === 1 ? info.key.toUpperCase() : info.key));
  return mods + base;
}

/** A condition that matches this key press in a keydown handler. */
export function matchSnippet(info: KeyInfo): string {
  const parts = [`event.code === ${JSON.stringify(info.code)}`];
  if (info.metaKey) parts.push("event.metaKey");
  if (info.ctrlKey) parts.push("event.ctrlKey");
  if (info.altKey) parts.push("event.altKey");
  if (info.shiftKey) parts.push("event.shiftKey");
  return `if (${parts.join(" && ")}) {\n  // …\n}`;
}
