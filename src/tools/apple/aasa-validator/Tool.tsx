import { json } from "@codemirror/lang-json";
import { useDeferredValue, useMemo } from "react";
import {
  CodeEditor,
  InputActions,
  OpenTextFileButton,
  SplitView,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/tools/shared/text";
import { type MatchResult, analyze, matchUrl, SIZE_LIMIT, sampleAasa, sampleUrls } from "./logic";

const jsonLanguage = json();

function MatchRow({ result }: { result: MatchResult }) {
  const opens = result.appIDs.length > 0;
  return (
    <div className="ds-row flex flex-col gap-0.5 rounded-lg px-2 py-1.5">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{result.url}</span>
        {result.error ? (
          <Badge variant="destructive">{result.error}</Badge>
        ) : (
          <Badge variant={opens ? "default" : "secondary"}>{opens ? "Opens app" : "Opens in browser"}</Badge>
        )}
      </div>
      {opens && (
        <span className="text-xs text-muted-foreground">
          {result.appIDs.join(", ")} · rule {result.rule}
        </span>
      )}
      {result.excludedBy.map((rule) => (
        <span key={rule} className="text-xs text-muted-foreground">
          Excluded by {rule}
        </span>
      ))}
    </div>
  );
}

export default function AasaValidatorTool() {
  const [input, setInput] = usePersistentState("input", "");
  const [urls, setUrls] = usePersistentState("urls", sampleUrls);
  const deferred = useDeferredValue(input);
  const deferredUrls = useDeferredValue(urls);

  const analysis = useMemo(() => (deferred.trim() ? analyze(deferred) : undefined), [deferred]);
  const results = useMemo(() => {
    const aasa = analysis?.aasa;
    if (!aasa) return [];
    return deferredUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean)
      .map((u) => matchUrl(aasa, u));
  }, [analysis, deferredUrls]);

  return (
    <ToolPage>
      <SplitView>
        <ToolSection
          title="apple-app-site-association"
          meta={analysis && `${formatBytes(analysis.size)} of ${formatBytes(SIZE_LIMIT)}`}
          actions={
            <>
              <OpenTextFileButton onOpen={setInput} />
              <InputActions value={input} onChange={setInput} sample={sampleAasa} />
            </>
          }
          fill
          padded={false}
        >
          <CodeEditor value={input} onChange={setInput} language={jsonLanguage} placeholder="Paste the file served at https://<domain>/.well-known/apple-app-site-association" />
        </ToolSection>
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
          <ToolSection title="Validation">
            {!analysis ? (
              <p className="text-[13px] text-muted-foreground">
                Paste the file, or fetch it with
                <code className="mx-1 rounded bg-field px-1 font-mono text-[12px]">curl -i https://example.com/.well-known/apple-app-site-association</code>
                and check it returns 200 over HTTPS with no redirect.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {analysis.issues.length === 0 && <StatusMessage tone="success">Valid association file</StatusMessage>}
                {analysis.issues.map((issue, i) => (
                  <StatusMessage key={i} tone={issue.level === "error" ? "error" : "info"}>
                    {issue.message}
                  </StatusMessage>
                ))}
              </div>
            )}
          </ToolSection>
          <ToolSection title="Test URLs" meta="One per line" actions={<InputActions value={urls} onChange={setUrls} />} className="h-44 shrink-0" fill padded={false}>
            <CodeEditor value={urls} onChange={setUrls} lineNumbers={false} placeholder="https://example.com/products/42" />
          </ToolSection>
          {results.length > 0 && (
            <ToolSection title="Results" className="shrink-0">
              <div className="flex flex-col gap-1">
                {results.map((r, i) => (
                  <MatchRow key={i} result={r} />
                ))}
              </div>
            </ToolSection>
          )}
        </div>
      </SplitView>
    </ToolPage>
  );
}
