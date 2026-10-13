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
    <DragRegion className="ds-toolbar flex h-(--toolbar-height) shrink-0 items-center gap-3 px-5">
      <div className="ds-icon-tile flex size-8 shrink-0 items-center justify-center rounded-[8px]">
        <Icon className="relative size-[18px]" strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <h1 className="ds-title truncate text-[16px] leading-tight font-semibold">{title}</h1>
        {description && (
          <p className="ds-title mt-px truncate text-[12px] text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>}
    </DragRegion>
  );
}
