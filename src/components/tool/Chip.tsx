import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Small pill for presets and quick picks, skinned by the theme (`ds-chip`). */
export function Chip({ selected, className, ...props }: ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <button
      type="button"
      data-selected={selected ? "true" : undefined}
      className={cn(
        "ds-chip h-6 rounded-full px-3 text-[12px] font-medium whitespace-nowrap outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        className,
      )}
      {...props}
    />
  );
}
