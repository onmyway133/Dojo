import { useState } from "react";
import {
  FieldList,
  FieldRow,
  FileDropZone,
  ResultList,
  ResultRow,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAsync } from "@/hooks/useAsync";
import { call } from "@/lib/invoke";
import { findMatch } from "./logic";

interface ArchUuid {
  arch: string;
  uuid: string | null;
}

const readUuids = (path: string) => call<{ binary: string; archs: ArchUuid[] }>("macho_uuids", { path });

export default function MachOUuidTool() {
  const [path, setPath] = useState<string>();
  const [expected, setExpected] = usePersistentState("expected", "");
  const result = useAsync(() => (path ? readUuids(path) : undefined), [path]);
  const archs = result.status === "success" ? result.value.archs : [];
  const match = expected.trim() ? findMatch(archs, expected) : undefined;

  return (
    <ToolPage layout="scroll">
      <FileDropZone
        onFile={setPath}
        title="Drop a .dSYM, .app, .framework or binary"
        subtitle="Click to choose a binary file; drag bundles and folders onto the window"
      />
      {result.status === "error" && <StatusMessage tone="error">{result.error}</StatusMessage>}
      {result.status === "success" && (
        <>
          <ToolSection title={result.value.binary.split("/").pop()} meta={`${archs.length} ${archs.length === 1 ? "architecture" : "architectures"}`}>
            <ResultList>
              <ResultRow label="Binary" value={result.value.binary} />
              {archs.map((a) => (
                <ResultRow
                  key={a.arch + a.uuid}
                  label={a.arch}
                  value={a.uuid ?? ""}
                  display={a.uuid ?? "No LC_UUID load command"}
                  mono
                  className={match === a ? "bg-(--ds-accent-soft)" : undefined}
                />
              ))}
            </ResultList>
          </ToolSection>
          <ToolSection title="Match a crash log">
            <FieldList>
              <FieldRow
                label="UUID"
                hint={expected.trim() ? (match ? undefined : "No architecture has this UUID; this build doesn't match the crash") : "Paste the UUID from the crash log's Binary Images section"}
                error={Boolean(expected.trim() && !match)}
              >
                <Input value={expected} onChange={(e) => setExpected(e.target.value)} spellCheck={false} className="font-mono text-[13px]" />
                {match && <Badge>Matches {match.arch}</Badge>}
              </FieldRow>
            </FieldList>
          </ToolSection>
        </>
      )}
    </ToolPage>
  );
}
