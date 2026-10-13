import { useDeferredValue, useMemo } from "react";
import { CodeEditor, InputActions, ToolPage, ToolSection, usePersistentState } from "@/components/tool";
import { formatBytes } from "@/tools/shared/text";
import { analyze, formatMinutes } from "./logic";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="ds-well m-0 px-3 py-2.5">
      <div className="text-[19px] font-semibold tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export default function TextAnalyzerTool() {
  const [text, setText] = usePersistentState("text", "");
  const deferred = useDeferredValue(text);
  const stats = useMemo(() => analyze(deferred), [deferred]);
  const maxCount = stats.topWords[0]?.[1] ?? 1;

  return (
    <ToolPage>
      <ToolSection title="Text" actions={<InputActions value={text} onChange={setText} />} fill padded={false}>
        <CodeEditor value={text} onChange={setText} lineNumbers={false} placeholder="Paste or type text to analyze" />
      </ToolSection>
      <div className="grid shrink-0 gap-4 @3xl:grid-cols-[2fr_1fr]">
        <ToolSection title="Statistics">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
            <Stat label="Characters" value={stats.characters} />
            <Stat label="Without spaces" value={stats.charactersNoSpaces} />
            <Stat label="Words" value={stats.words} />
            <Stat label="Lines" value={stats.lines} />
            <Stat label="Sentences" value={stats.sentences} />
            <Stat label="Paragraphs" value={stats.paragraphs} />
            <Stat label="UTF-8 size" value={formatBytes(stats.bytes)} />
            <Stat label="Reading time" value={formatMinutes(stats.readingMinutes)} />
            <Stat label="Speaking time" value={formatMinutes(stats.speakingMinutes)} />
          </div>
        </ToolSection>
        <ToolSection title="Top Words" meta="3+ letters">
          {stats.topWords.length === 0 && <p className="text-[13px] text-muted-foreground">No words yet.</p>}
          <ol className="flex flex-col gap-1">
            {stats.topWords.map(([word, count]) => (
              <li key={word} className="flex items-center gap-2 text-[13px]">
                <span className="w-28 truncate">{word}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--ds-switch-bg)">
                  <span className="block h-full rounded-full bg-(--ds-accent)" style={{ width: `${(count / maxCount) * 100}%` }} />
                </span>
                <span className="w-8 text-right text-muted-foreground tabular-nums">{count}</span>
              </li>
            ))}
          </ol>
        </ToolSection>
      </div>
    </ToolPage>
  );
}
