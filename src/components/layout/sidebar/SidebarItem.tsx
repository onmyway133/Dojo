import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router";

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
      className="ds-sidebar-item flex items-center gap-2 px-2 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Icon className="relative size-4 shrink-0" strokeWidth={1.75} />
      <span className="relative truncate">{label}</span>
    </NavLink>
  );
}
