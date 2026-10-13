import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Lets the window be moved (and zoomed with a double click) from this area, like a
 * native title bar. Children that should not start a drag need `pointer-events-auto`
 * on an interactive element; plain text inside is made click-through.
 */
export function DragRegion({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-tauri-drag-region
      className={cn("chrome [&_*:not(button,input,a,[role=button])]:pointer-events-none", className)}
      {...props}
    />
  );
}
