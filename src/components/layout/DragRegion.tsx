import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Lets the window be moved (and zoomed with a double click) from this area, like a native
 * title bar. "deep" makes the whole subtree draggable; Tauri skips buttons, links, inputs
 * and other interactive elements, so controls inside keep working.
 */
export function DragRegion({ className, ...props }: ComponentProps<"div">) {
  return <div data-tauri-drag-region="deep" className={cn("chrome", className)} {...props} />;
}
