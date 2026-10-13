import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DragRegion } from "@/components/layout/DragRegion";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
}

/** Top of every page. Doubles as the window's title bar, so it is a drag region. */
export function PageHeader({ icon: Icon, title, description, actions }: PageHeaderProps) {
  return (
    <DragRegion className="flex shrink-0 items-center gap-3.5 px-6 pt-5 pb-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-primary">
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-[19px] leading-tight font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>}
    </DragRegion>
  );
}
