import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Small filled pill for presets and quick picks. Selected state is a tinted fill. */
export function Chip({ selected, className, ...props }: ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "h-7 rounded-full px-3 text-[12px] font-medium whitespace-nowrap outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        selected ? "bg-selected text-primary" : "bg-field text-foreground hover:bg-field-hover",
        className,
      )}
      {...props}
    />
  );
}
