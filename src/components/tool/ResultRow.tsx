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
  className?: string;
}

/** One labelled output with a copy button, for tools that show many results at once. */
export function ResultRow({ label, value, mono, display, className }: ResultRowProps) {
  return (
    <div
      className={cn(
        "group flex min-h-9 items-center gap-3 rounded-lg px-2 py-1 hover:bg-field",
        className,
      )}
    >
      <div className="w-32 shrink-0 text-[13px] text-muted-foreground">{label}</div>
      <div
        className={cn(
          "min-w-0 flex-1 text-[13px] break-all select-text",
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
