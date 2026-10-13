import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  error: { icon: CircleAlert, className: "bg-destructive/10 text-destructive" },
  success: { icon: CircleCheck, className: "bg-success/12 text-success" },
  info: { icon: Info, className: "bg-field text-muted-foreground" },
};

/** Inline feedback such as a parse error. Tinted fill, no border. */
export function StatusMessage({
  tone = "info",
  children,
  className,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, className: toneClass } = tones[tone];
  return (
    <div className={cn("flex items-start gap-2 rounded-lg px-3 py-2 text-[13px]", toneClass, className)}>
      <Icon className="mt-px size-4 shrink-0" />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}
