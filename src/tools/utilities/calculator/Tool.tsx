import { useDeferredValue, useMemo } from "react";
import {
  CodeEditor,
  CopyButton,
  InputActions,
  SplitView,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { cn } from "@/lib/utils";
import { evaluateLines } from "./logic";

const sample = `# Shared variables work across lines
rate = 85
hours = 37.5
rate * hours
round(sqrt(2), 4)
2^10
12 kg to lb
90 deg to rad
sin(30 deg)
[1, 2, 3] * 2`;

export default function CalculatorTool() {
  const [text, setText] = usePersistentState("text", sample);
  const deferred = useDeferredValue(text);
  const lines = useMemo(() => evaluateLines(deferred), [deferred]);
  const last = [...lines].reverse().find((l) => l.result !== undefined);

  return (
    <ToolPage>
      <SplitView>
        <ToolSection title="Expressions" meta="One per line" actions={<InputActions value={text} onChange={setText} sample={sample} />} fill padded={false}>
          <CodeEditor value={text} onChange={setText} />
        </ToolSection>
        <ToolSection title="Results" actions={last?.result ? <CopyButton label="Copy Last Result" value={last.result} /> : undefined} fill className="overflow-y-auto">
          <ol className="-mx-2 flex flex-col">
            {lines.map((line, index) => (
              <li
                key={index}
                className={cn("ds-row group flex min-h-[25px] items-center gap-3 rounded-md px-2", !line.result && !line.error && "opacity-0")}
              >
                <span className="w-6 text-right text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                {line.error ? (
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-destructive" title={line.error}>{line.error}</span>
                ) : (
                  <span className="min-w-0 flex-1 truncate font-mono text-[13px] font-medium select-text">{line.result}</span>
                )}
                {line.result && (
                  <span className="opacity-0 group-hover:opacity-100">
                    <CopyButton value={line.result} />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </ToolSection>
      </SplitView>
    </ToolPage>
  );
}
