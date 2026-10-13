import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { FolderOpen } from "lucide-react";
import { ResultList, ResultRow, ToolSection } from "@/components/tool";
import { Button } from "@/components/ui/button";
import { fileName } from "@/lib/files";
import type { WriteResult } from "./useImageFile";
import { formatBytes } from "./text";

/** Summary of a file written by an image tool, with a Show in Finder button. */
export function SavedResult({ path, result }: { path: string; result: WriteResult }) {
  const saved = result.bytesBefore - result.bytesAfter;
  const percent = result.bytesBefore ? Math.round((saved / result.bytesBefore) * 100) : 0;
  return (
    <ToolSection
      title="Saved"
      meta={fileName(path)}
      actions={
        <Button variant="ghost" size="sm" onClick={() => revealItemInDir(path)}>
          <FolderOpen /> Show in Finder
        </Button>
      }
      className="shrink-0"
    >
      <ResultList>
        <ResultRow label="Dimensions" value={`${result.width} × ${result.height}`} />
        <ResultRow label="Before" value={formatBytes(result.bytesBefore)} />
        <ResultRow
          label="After"
          value={`${formatBytes(result.bytesAfter)}${saved > 0 ? ` (${percent}% smaller)` : saved < 0 ? ` (${-percent}% larger)` : ""}`}
        />
        <ResultRow label="Location" value={path} />
      </ResultList>
    </ToolSection>
  );
}
