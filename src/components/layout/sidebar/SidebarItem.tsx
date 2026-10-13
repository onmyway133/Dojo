import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  /** Exact match only, for the home route. */
  end?: boolean;
}

export function SidebarItem({ to, icon: Icon, label, end }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      draggable={false}
      className={({ isActive }) =>
        cn(
          "flex h-7 items-center gap-2 rounded-md px-2 text-[13px] outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring/60",
          isActive ? "bg-selected font-medium" : "hover:bg-sidebar-accent",
        )
      }
    >
      <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.75} />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
