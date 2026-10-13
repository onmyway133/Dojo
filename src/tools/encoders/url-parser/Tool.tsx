import { Plus, X } from "lucide-react";
import { useMemo } from "react";
import {
  CopyButton,
  IconAction,
  InputActions,
  ResultList,
  ResultRow,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseUrl, withParams } from "./logic";

const sample = "https://api.example.com:8443/v2/search?q=swift%20ui&sort=stars&page=2#results";

export default function UrlParserTool() {
  const [input, setInput] = usePersistentState("input", sample);

  const parsed = useMemo(() => {
    if (!input.trim()) return undefined;
    try {
      return { ok: true as const, ...parseUrl(input) };
    } catch (error) {
      return { ok: false as const, error: (error as Error).message };
    }
  }, [input]);

  const params = parsed?.ok ? parsed.params : [];
  const updateParams = (next: [string, string][]) => setInput(withParams(input, next));
  const setParam = (index: number, key: string, value: string) =>
    updateParams(params.map((p, i) => (i === index ? [key, value] : p)));

  return (
    <ToolPage layout="scroll">
      <ToolSection title="URL" actions={<><CopyButton value={input} /><InputActions value={input} onChange={setInput} sample={sample} /></>}>
        <Input value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} className="h-10 font-mono text-[13px]" />
      </ToolSection>

      {parsed && !parsed.ok && <StatusMessage tone="error">{parsed.error}</StatusMessage>}

      {parsed?.ok && (
        <>
          <ToolSection title="Parts">
            <ResultList>
              <ResultRow label="Protocol" value={parsed.url.protocol.replace(/:$/, "")} mono />
              {parsed.url.username && <ResultRow label="Username" value={decodeURIComponent(parsed.url.username)} mono />}
              {parsed.url.password && <ResultRow label="Password" value={decodeURIComponent(parsed.url.password)} mono />}
              <ResultRow label="Host" value={parsed.url.hostname} mono />
              <ResultRow label="Port" value={parsed.url.port} mono />
              <ResultRow label="Path" value={decodeURIComponent(parsed.url.pathname)} mono />
              <ResultRow label="Query" value={parsed.url.search.replace(/^\?/, "")} mono />
              <ResultRow label="Fragment" value={decodeURIComponent(parsed.url.hash.replace(/^#/, ""))} mono />
              <ResultRow label="Origin" value={parsed.url.origin} mono />
            </ResultList>
          </ToolSection>

          <ToolSection
            title="Query Parameters"
            meta={`${params.length} ${params.length === 1 ? "parameter" : "parameters"}`}
            actions={
              <Button variant="ghost" size="sm" onClick={() => updateParams([...params, ["key", "value"]])}>
                <Plus /> Add
              </Button>
            }
          >
            <div className="flex flex-col gap-1.5">
              {params.map(([key, value], index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <Input
                    value={key}
                    onChange={(e) => setParam(index, e.target.value, value)}
                    spellCheck={false}
                    className="w-56 font-mono text-[13px]"
                    aria-label="Key"
                  />
                  <Input
                    value={value}
                    onChange={(e) => setParam(index, key, e.target.value)}
                    spellCheck={false}
                    className="flex-1 font-mono text-[13px]"
                    aria-label="Value"
                  />
                  <CopyButton value={value} />
                  <IconAction label="Remove" onClick={() => updateParams(params.filter((_, i) => i !== index))}>
                    <X />
                  </IconAction>
                </div>
              ))}
              {params.length === 0 && <p className="text-[13px] text-muted-foreground">This URL has no query parameters.</p>}
            </div>
          </ToolSection>
        </>
      )}
    </ToolPage>
  );
}
