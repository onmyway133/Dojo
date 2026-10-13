import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Input next to output when there is room, stacked when the window is narrow. */
export function SplitView({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-4 @3xl:grid-cols-2 @3xl:auto-rows-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}
