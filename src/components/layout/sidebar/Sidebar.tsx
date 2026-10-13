import { LayoutGrid } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { getTool, groupByCategory, searchTools, tools } from "@/tools/registry";
import type { ToolMeta } from "@/tools/types";
import { useLibrary } from "@/stores/library";
import { useSearch } from "@/stores/search";
import { DragRegion } from "../DragRegion";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItem } from "./SidebarItem";
import { SidebarSearch } from "./SidebarSearch";

export function Sidebar() {
  const query = useSearch((s) => s.query);
  const favoriteIds = useLibrary((s) => s.favorites);
  const navigate = useNavigate();

  const searching = query.trim().length > 0;
  const matches = useMemo(() => searchTools(tools, query), [query]);
  const groups = useMemo(() => groupByCategory(matches), [matches]);
  const favorites = useMemo(
    () => favoriteIds.map(getTool).filter((t): t is ToolMeta => t !== undefined),
    [favoriteIds],
  );

  function openFirstMatch() {
    if (matches[0]) navigate(`/tools/${matches[0].id}`);
  }

  return (
    <aside className="ds-sidebar chrome flex w-60 shrink-0 flex-col">
      {/* Room for the traffic lights, and a handle to move the window. */}
      <DragRegion className="ds-toolbar h-(--toolbar-height) shrink-0" />
      <div className="px-3 pt-3 pb-1">
        <SidebarSearch onSubmit={openFirstMatch} />
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {!searching && (
          <div className="pt-3">
            <SidebarItem to="/" end icon={LayoutGrid} label="All Tools" />
          </div>
        )}
        {!searching && favorites.length > 0 && (
          <SidebarGroup id="favorites" title="Favorites">
            {favorites.map((tool) => (
              <SidebarItem key={tool.id} to={`/tools/${tool.id}`} icon={tool.icon} label={tool.name} />
            ))}
          </SidebarGroup>
        )}
        {groups.map(({ category, tools: groupTools }) => (
          <SidebarGroup key={category.id} id={category.id} title={category.name} forceOpen={searching}>
            {groupTools.map((tool) => (
              <SidebarItem key={tool.id} to={`/tools/${tool.id}`} icon={tool.icon} label={tool.name} />
            ))}
          </SidebarGroup>
        ))}
        {searching && groups.length === 0 && (
          <p className="px-2 pt-6 text-center text-[13px] text-muted-foreground">No tools match “{query.trim()}”</p>
        )}
      </nav>
    </aside>
  );
}
