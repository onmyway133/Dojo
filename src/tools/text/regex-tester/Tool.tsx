import { type Range, RangeSetBuilder } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";
import { useDeferredValue, useMemo } from "react";
import {
  Chip,
  CodeEditor,
  CopyButton,
  InputActions,
  SplitView,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Input } from "@/components/ui/input";
import { captureNames, findMatches, type RegexMatch, replaceAll } from "./logic";

const flagInfo = [
  { flag: "g", label: "global" },
  { flag: "i", label: "ignore case" },
  { flag: "m", label: "multiline" },
  { flag: "s", label: "dot all" },
  { flag: "u", label: "unicode" },
  { flag: "y", label: "sticky" },
];

const matchMark = Decoration.mark({ class: "cm-regex-match" });
const highlightTheme = EditorView.baseTheme({
  ".cm-regex-match": {
    background: "color-mix(in oklab, var(--ds-accent) 22%, transparent)",
    borderBottom: "2px solid var(--ds-accent)",
    borderRadius: "2px",
  },
});

/** Decorations recomputed from the current doc so stale ranges can never go out of bounds. */
function highlight(matches: RegexMatch[]) {
  return [
    highlightTheme,
    EditorView.decorations.compute(["doc"], (state) => {
      const builder = new RangeSetBuilder<Decoration>();
      const ranges: Range<Decoration>[] = [];
      for (const m of matches) {
        if (m.end > m.index && m.end <= state.doc.length) ranges.push(matchMark.range(m.index, m.end));
      }
      for (const r of ranges) builder.add(r.from, r.to, r.value);
      return builder.finish();
    }),
  ];
}

const sample = `Contact: ada@example.com, grace@navy.mil
Support: help@example.com (Mon-Fri)
Invalid: not-an-email@, @missing.com`;

export default function RegexTesterTool() {
  const [pattern, setPattern] = usePersistentState("pattern", "[\\w.+-]+@([\\w-]+\\.)+\\w+");
  const [flags, setFlags] = usePersistentState("flags", "g");
  const [text, setText] = usePersistentState("text", sample);
  const [replacement, setReplacement] = usePersistentState("replacement", "<$&>");

  const deferredText = useDeferredValue(text);
  const result = useMemo(() => findMatches(pattern, flags, deferredText), [pattern, flags, deferredText]);
  const matches = result.ok ? result.matches : [];
  const groupNames = useMemo(() => captureNames(pattern), [pattern]);
  const extensions = useMemo(() => highlight(matches), [matches]);
  const replaced = useMemo(() => (result.ok ? replaceAll(pattern, flags, deferredText, replacement) : ""), [result.ok, pattern, flags, deferredText, replacement]);

  const toggleFlag = (flag: string) =>
    setFlags((f) => (f.includes(flag) ? f.replace(flag, "") : [...f, flag].sort().join("")));

  return (
    <ToolPage>
      <ToolSection title="Pattern" className="shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[15px] text-muted-foreground">/</span>
          <Input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck={false}
            aria-invalid={!result.ok || undefined}
            className="h-9 flex-1 font-mono text-[14px]"
          />
          <span className="font-mono text-[15px] text-muted-foreground">/{flags}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {flagInfo.map(({ flag, label }) => (
            <Chip key={flag} selected={flags.includes(flag)} onClick={() => toggleFlag(flag)}>
              <span className="font-mono">{flag}</span> {label}
            </Chip>
          ))}
        </div>
        {!result.ok && <StatusMessage tone="error" className="mt-3">{result.error}</StatusMessage>}
      </ToolSection>
      <SplitView>
        <ToolSection
          title="Test String"
          meta={result.ok ? `${matches.length}${result.truncated ? "+" : ""} ${matches.length === 1 ? "match" : "matches"}` : undefined}
          actions={<InputActions value={text} onChange={setText} sample={sample} />}
          fill
          padded={false}
        >
          <CodeEditor value={text} onChange={setText} extensions={extensions} />
        </ToolSection>
        <ToolSection title="Matches" fill className="overflow-y-auto">
          {matches.length === 0 && <p className="text-[13px] text-muted-foreground">No matches.</p>}
          <ol className="-mx-2 flex flex-col gap-0.5">
            {matches.slice(0, 300).map((m, i) => (
              <li key={`${m.index}-${i}`} className="ds-row group rounded-lg px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                  <code className="min-w-0 flex-1 truncate font-mono text-[12.5px] select-text">{m.text || "(empty)"}</code>
                  <span className="text-xs text-muted-foreground tabular-nums">{m.index}–{m.end}</span>
                  <span className="opacity-0 group-hover:opacity-100">
                    <CopyButton value={m.text} />
                  </span>
                </div>
                {m.groups.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1 pl-8">
                    {m.groups.map((g, gi) => (
                      <span key={gi} className="ds-badge rounded-full px-2 py-px font-mono text-[11px]">
                        {groupNames[gi] ?? `$${gi + 1}`}: {g ?? "undefined"}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </ToolSection>
      </SplitView>
      <ToolSection title="Replace" meta="$1, $<name> and $& work" actions={<CopyButton value={replaced} />} className="h-48 shrink-0" padded={false}>
        <div className="px-4 pb-2">
          <Input value={replacement} onChange={(e) => setReplacement(e.target.value)} spellCheck={false} className="font-mono text-[13px]" />
        </div>
        <CodeEditor value={replaced} readOnly lineNumbers={false} />
      </ToolSection>
    </ToolPage>
  );
}
