import { LayoutGrid } from "lucide-react";
import { useMemo } from "react";
import { PageHeader } from "@/components/tool/PageHeader";
import { useSearch } from "@/stores/search";
import { groupByCategory, searchTools, tools } from "@/tools/registry";
import { ToolCard } from "./ToolCard";

export function HomePage() {
  const query = useSearch((s) => s.query);
  const groups = useMemo(() => groupByCategory(searchTools(tools, query)), [query]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        icon={LayoutGrid}
        title="All Tools"
        description={`${tools.length} tools for everyday development`}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        {groups.map(({ category, tools: groupTools }) => (
          <section key={category.id} className="pt-5 first:pt-1">
            <h2 className="mb-2.5 flex items-baseline gap-2 text-[15px] font-semibold">
              {category.name}
              <span className="text-xs font-normal text-muted-foreground">{groupTools.length}</span>
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
              {groupTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        ))}
        {groups.length === 0 && (
          <p className="pt-16 text-center text-[13px] text-muted-foreground">No tools match “{query.trim()}”</p>
        )}
      </div>
    </div>
  );
}
