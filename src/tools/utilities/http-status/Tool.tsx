import { useMemo } from "react";
import { CopyButton, ToolPage, ToolSection, usePersistentState } from "@/components/tool";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { classes, statuses } from "./data";

const tone = ["", "text-muted-foreground", "text-success", "text-(--ds-accent)", "text-warning", "text-destructive"];

export default function HttpStatusTool() {
  const [query, setQuery] = usePersistentState("query", "");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return statuses;
    return statuses.filter((s) => String(s.code).startsWith(q) || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }, [query]);

  return (
    <ToolPage layout="scroll">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by code or name, e.g. 4, 429 or redirect"
        className="h-9 shrink-0 text-[14px]"
        autoFocus
      />
      {classes.map(({ prefix, name }) => {
        const group = filtered.filter((s) => Math.floor(s.code / 100) === prefix);
        if (group.length === 0) return null;
        return (
          <ToolSection key={prefix} title={`${prefix}xx ${name}`} meta={`${group.length}`} className="shrink-0">
            <ul className="-mx-2 flex flex-col gap-0.5">
              {group.map((s) => (
                <li key={s.code} className="ds-row group flex items-start gap-3 rounded-lg px-2 py-1.5">
                  <span className={cn("w-10 font-mono text-[14px] font-semibold tabular-nums", tone[prefix])}>{s.code}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                  </div>
                  <span className="opacity-0 group-hover:opacity-100">
                    <CopyButton value={`${s.code} ${s.name}`} />
                  </span>
                </li>
              ))}
            </ul>
          </ToolSection>
        );
      })}
      {filtered.length === 0 && <p className="pt-8 text-center text-[13px] text-muted-foreground">No status codes match.</p>}
    </ToolPage>
  );
}
