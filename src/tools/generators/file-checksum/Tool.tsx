import { useState } from "react";
import {
  FileDropZone,
  FieldList,
  FieldRow,
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
import { fileInfo, fileName } from "@/lib/files";
import { allHashAlgorithms, hashAlgorithmNames, hashFile } from "@/tools/shared/hash";
import { formatBytes } from "@/tools/shared/text";

const normalize = (hex: string) => hex.trim().toLowerCase().replace(/[\s:-]/g, "");

export default function FileChecksumTool() {
  const [path, setPath] = useState<string>();
  const [expected, setExpected] = usePersistentState("expected", "");

  const result = useAsync(
    () => (path ? Promise.all([fileInfo(path), hashFile(path, allHashAlgorithms)]) : undefined),
    [path],
  );
  const [info, hashes] = result.status === "success" ? result.value : [undefined, undefined];
  const match = expected.trim() && hashes?.find((h) => h.hex === normalize(expected));

  return (
    <ToolPage layout="scroll">
      <FileDropZone onFile={setPath} title="Drop a file or click to choose" subtitle="Hashed locally, any size" className="shrink-0" />
      {result.status === "loading" && <StatusMessage>Hashing {path && fileName(path)}…</StatusMessage>}
      {result.status === "error" && <StatusMessage tone="error">{result.error}</StatusMessage>}
      {info && hashes && (
        <>
          <ToolSection title={info.name} meta={formatBytes(info.size)}>
            <ResultList>
              {hashes.map(({ algorithm, hex }) => (
                <ResultRow
                  key={algorithm}
                  label={hashAlgorithmNames[algorithm]}
                  value={hex}
                  mono
                  className={match && match.algorithm === algorithm ? "bg-(--ds-accent-soft)" : undefined}
                />
              ))}
            </ResultList>
          </ToolSection>
          <ToolSection title="Verify">
            <FieldList>
              <FieldRow
                label="Expected"
                hint={expected.trim() ? (match ? undefined : "Doesn't match any of the hashes above") : "Paste a checksum from the download page"}
                error={Boolean(expected.trim() && !match)}
              >
                <Input value={expected} onChange={(e) => setExpected(e.target.value)} spellCheck={false} className="font-mono text-[13px]" />
                {match && <Badge>Matches {hashAlgorithmNames[match.algorithm]}</Badge>}
              </FieldRow>
            </FieldList>
          </ToolSection>
        </>
      )}
    </ToolPage>
  );
}
