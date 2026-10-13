import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToolSectionProps {
  title?: string;
  /** Short status next to the title, e.g. "42 lines" or "Valid". */
  meta?: ReactNode;
  /** Buttons on the right of the title row (copy, paste, clear...). */
  actions?: ReactNode;
  children: ReactNode;
  /** Grow to share the remaining height (editors). */
  fill?: boolean;
  /** Pad the content. Off for edge-to-edge editors. */
  padded?: boolean;
  className?: string;
}

/** A panel with a title row. Its look comes from the theme (`ds-panel`). */
export function ToolSection({
  title,
  meta,
  actions,
  children,
  fill,
  padded = true,
  className,
}: ToolSectionProps) {
  const hasHeader = title || actions || meta;
  return (
    <section
      className={cn(
        "ds-panel flex min-h-0 min-w-0 flex-col",
        fill && "flex-1",
        !hasHeader && padded && "pt-3",
        className,
      )}
    >
      {hasHeader && (
        <header className="flex h-10 shrink-0 items-center gap-2 pr-2 pl-4">
          {title && <h2 className="ds-panel-title text-[13px] font-semibold">{title}</h2>}
          {meta && <span className="truncate text-xs text-muted-foreground">{meta}</span>}
          {actions && <div className="ml-auto flex items-center gap-0.5">{actions}</div>}
        </header>
      )}
      <div className={cn("flex min-h-0 flex-1 flex-col", padded && "px-4 pb-4")}>{children}</div>
    </section>
  );
}
