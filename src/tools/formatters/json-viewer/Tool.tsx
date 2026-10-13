import { json } from "@codemirror/lang-json";
import { ChevronsDownUp, ChevronsUpDown, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import {
  CodeEditor,
  IconAction,
  InputActions,
  SplitView,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { parseJson, sampleJson } from "@/tools/shared/json";
import { describeText } from "@/tools/shared/text";
import { JsonTree } from "./JsonTree";
import { containerPaths, matchingPaths } from "./logic";

const jsonLanguage = json();

export default function JsonViewerTool() {
  const [input, setInput] = usePersistentState("input", "");
  const [filter, setFilter] = useState("");
  const deferredInput = useDeferredValue(input);
  const parsed = useMemo(() => (deferredInput.trim() ? parseJson(deferredInput) : undefined), [deferredInput]);
  const root = parsed?.ok ? parsed.value : undefined;

  // Expansion is keyed by path; reset to two levels whenever a new document arrives.
  const [expansion, setExpansion] = useState<{ root: unknown; paths: Set<string> }>();
  const expanded = expansion && expansion.root === root ? expansion.paths : containerPaths(root, 1);
  const setExpanded = (paths: Set<string>) => setExpansion({ root, paths });

  const deferredFilter = useDeferredValue(filter.trim());
  const visible = useMemo(
    () => (deferredFilter && root !== undefined ? matchingPaths(root, deferredFilter) : undefined),
    [root, deferredFilter],
  );

  function toggle(path: string) {
    const next = new Set(expanded);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpanded(next);
  }

  return (
    <ToolPage>
      <SplitView>
        <ToolSection
          title="JSON"
          meta={describeText(input)}
          actions={<InputActions value={input} onChange={setInput} sample={sampleJson} />}
          fill
          padded={false}
        >
          <CodeEditor value={input} onChange={setInput} language={jsonLanguage} placeholder="Paste JSON here" />
        </ToolSection>
        <ToolSection
          title="Tree"
          fill
          padded={false}
          actions={
            <>
              <div className="relative mr-1">
                <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter keys and values"
                  className="h-7 w-48 rounded-md bg-field pr-2 pl-7 text-[12px] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
              <IconAction label="Expand All" onClick={() => setExpanded(containerPaths(root))} disabled={root === undefined}>
                <ChevronsUpDown />
              </IconAction>
              <IconAction label="Collapse All" onClick={() => setExpanded(new Set(["$"]))} disabled={root === undefined}>
                <ChevronsDownUp />
              </IconAction>
            </>
          }
        >
          <div className="min-h-0 flex-1 overflow-auto px-2 pb-3">
            {parsed && !parsed.ok && (
              <StatusMessage tone="error" className="mx-2">
                {parsed.error}
              </StatusMessage>
            )}
            {root !== undefined && <JsonTree value={root} expanded={expanded} onToggle={toggle} visible={visible} />}
            {!parsed && <p className="px-2 pt-2 text-[13px] text-muted-foreground">The tree appears here.</p>}
          </div>
        </ToolSection>
      </SplitView>
    </ToolPage>
  );
}
