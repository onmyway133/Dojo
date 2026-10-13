import { getCurrentWebview } from "@tauri-apps/api/webview";
import { useEffect, useEffectEvent, useState } from "react";
import { inTauri } from "@/lib/platform";

/**
 * Native file drops onto the window. Tauri hands over real paths, so large files
 * can be processed in Rust without copying them through the webview.
 */
export function useFileDrop(onDrop: (paths: string[]) => void, enabled = true): boolean {
  const [dragging, setDragging] = useState(false);
  const handleDrop = useEffectEvent(onDrop);

  useEffect(() => {
    if (!inTauri || !enabled) return;
    let unlisten: (() => void) | undefined;
    let cancelled = false;
    getCurrentWebview()
      .onDragDropEvent(({ payload }) => {
        if (payload.type === "enter") setDragging(true);
        else if (payload.type === "leave") setDragging(false);
        else if (payload.type === "drop") {
          setDragging(false);
          if (payload.paths.length > 0) handleDrop(payload.paths);
        }
      })
      .then((fn) => {
        if (cancelled) fn();
        else unlisten = fn;
      });
    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [enabled]);

  return dragging;
}
