import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldRowProps {
  label: ReactNode;
  children: ReactNode;
  /** Small text under the control, e.g. a validation error. */
  hint?: ReactNode;
  error?: boolean;
  className?: string;
}

/** Label on the left, control on the right, for form-like tools. */
export function FieldRow({ label, children, hint, error, className }: FieldRowProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="w-32 shrink-0 pt-1.5 text-[13px] text-muted-foreground">{label}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">{children}</div>
        {hint && (
          <p className={cn("mt-1 text-xs", error ? "text-destructive" : "text-muted-foreground")}>{hint}</p>
        )}
      </div>
    </div>
  );
}

/** Stack of FieldRows with consistent spacing. */
export function FieldList({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}
