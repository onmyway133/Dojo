import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const icons = { error: CircleAlert, success: CircleCheck, info: Info };

/** Inline feedback such as a parse error, skinned per tone (`ds-status`). */
export function StatusMessage({
  tone = "info",
  children,
  className,
}: {
  tone?: keyof typeof icons;
  children: ReactNode;
  className?: string;
}) {
  const Icon = icons[tone];
  return (
    <div data-tone={tone} className={cn("ds-status flex items-start gap-2 rounded-lg px-3 py-2 text-[13px]", className)}>
      <Icon className="mt-px size-4 shrink-0" />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}
