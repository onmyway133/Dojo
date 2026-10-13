import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CopyButton } from "./actions";

interface ResultRowProps {
  label: ReactNode;
  value: string;
  /** Monospace for hashes, numbers and code-like values. */
  mono?: boolean;
  /** Shown instead of `value` (e.g. a formatted variant), `value` is still what gets copied. */
  display?: ReactNode;
  /** Narrow label column for short labels such as row numbers. */
  compact?: boolean;
  className?: string;
}

/** One labelled output with a copy button, for tools that show many results at once. */
export function ResultRow({ label, value, mono, display, compact, className }: ResultRowProps) {
  return (
    <div
      className={cn(
        "ds-row group flex min-h-9 items-center gap-3 rounded-lg px-2 py-1",
        className,
      )}
    >
      <div className={cn("shrink-0 text-[13px] text-muted-foreground", compact ? "w-7 text-right tabular-nums" : "w-32")}>{label}</div>
      <div
        className={cn(
          "min-w-0 flex-1 text-[13px] whitespace-pre-wrap select-text [overflow-wrap:anywhere]",
          mono && "font-mono text-[12.5px]",
          !value && "text-muted-foreground",
        )}
      >
        {display ?? (value || "—")}
      </div>
      <div className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <CopyButton value={value} />
      </div>
    </div>
  );
}

/** Vertical stack of ResultRows with tight spacing. */
export function ResultList({ children }: { children: ReactNode }) {
  return <div className="-mx-2 flex flex-col gap-0.5">{children}</div>;
}
