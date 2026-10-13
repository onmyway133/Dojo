import type { ReactNode } from "react";

/** System Settings style row: title and help on the left, the control on the right. */
export function SettingRow({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-11 items-center gap-4 py-1.5">
      <div className="min-w-0 flex-1">
        <div className="text-[13px]">{title}</div>
        {description && <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

/** Vertical stack of SettingRows. Spacing separates rows; no divider lines. */
export function SettingList({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}
