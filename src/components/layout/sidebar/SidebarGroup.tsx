import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLibrary } from "@/stores/library";

interface SidebarGroupProps {
  id: string;
  title: string;
  children: ReactNode;
  /** Groups stay open while searching so every match is visible. */
  forceOpen?: boolean;
}

export function SidebarGroup({ id, title, children, forceOpen }: SidebarGroupProps) {
  const collapsed = useLibrary((s) => s.collapsed.includes(id));
  const toggle = useLibrary((s) => s.toggleCollapsed);
  const open = forceOpen || !collapsed;

  return (
    <section className="pt-3">
      <button
        type="button"
        onClick={() => toggle(id)}
        className="group flex h-6 w-full items-center justify-between rounded-md px-2 text-[11px] font-semibold text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        {title}
        <ChevronRight
          className={cn(
            "size-3.5 opacity-0 transition group-hover:opacity-100",
            open && "rotate-90",
          )}
        />
      </button>
      {open && <div className="mt-0.5 flex flex-col gap-px">{children}</div>}
    </section>
  );
}
