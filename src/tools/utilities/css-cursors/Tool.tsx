import { useMemo } from "react";
import { toast } from "sonner";
import { ToolPage, ToolSection, usePersistentState } from "@/components/tool";
import { Input } from "@/components/ui/input";
import { copyText } from "@/lib/clipboard";
import { cursorGroups } from "./data";
import { filterCursors } from "./logic";

async function copy(value: string) {
  const css = `cursor: ${value};`;
  try {
    await copyText(css);
    toast.success("Copied", { description: css });
  } catch (error) {
    toast.error("Couldn't copy", { description: String(error) });
  }
}

export default function CssCursorsTool() {
  const [query, setQuery] = usePersistentState("query", "");
  const groups = useMemo(() => filterCursors(cursorGroups, query), [query]);

  return (
    <ToolPage layout="scroll">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter cursors, e.g. resize or drag"
        className="h-9 shrink-0 text-[14px]"
        autoFocus
      />
      {groups.map((group) => (
        <ToolSection key={group.name} title={group.name} meta={`${group.cursors.length}`} className="shrink-0">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
            {group.cursors.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => copy(c.value)}
                style={{ cursor: c.value }}
                className="ds-cell flex min-h-20 flex-col items-start gap-1 p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <code className="font-mono text-[13px] font-medium">{c.value}</code>
                <span className="text-xs text-muted-foreground">{c.description}</span>
              </button>
            ))}
          </div>
        </ToolSection>
      ))}
      {groups.length === 0 && <p className="pt-8 text-center text-[13px] text-muted-foreground">No cursors match.</p>}
    </ToolPage>
  );
}
