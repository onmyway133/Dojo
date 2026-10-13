import { useEffect, useEffectEvent } from "react";

interface Hotkey {
  /** `KeyboardEvent.key`, compared case-insensitively. */
  key: string;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
}

/** Runs `handler` on a global key combo. ⌘ is `meta` (macOS first). */
export function useHotkey(hotkey: Hotkey, handler: (event: KeyboardEvent) => void) {
  const { key, meta = false, shift = false, alt = false } = hotkey;
  const onMatch = useEffectEvent(handler);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.metaKey === meta &&
        event.shiftKey === shift &&
        event.altKey === alt
      ) {
        event.preventDefault();
        onMatch(event);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, meta, shift, alt]);
}
