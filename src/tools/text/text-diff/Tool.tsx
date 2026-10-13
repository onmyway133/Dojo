import { ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import {
  DiffEditor,
  IconAction,
  OptionSwitch,
  PasteButton,
  ClearButton,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";

const sampleA = `{
  "name": "devtools",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}`;
const sampleB = `{
  "name": "devtools",
  "version": "1.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest"
  }
}`;

export default function TextDiffTool() {
  const [original, setOriginal] = usePersistentState("original", sampleA);
  const [modified, setModified] = usePersistentState("modified", sampleB);
  const [collapse, setCollapse] = usePersistentState("collapse", false);
  const [chunks, setChunks] = useState<number>();

  return (
    <ToolPage>
      <ToolOptions>
        <OptionSwitch label="Collapse unchanged lines" checked={collapse} onChange={setCollapse} />
      </ToolOptions>
      <ToolSection
        title="Original ⟷ Changed"
        meta={chunks === undefined ? undefined : chunks === 0 ? "No differences" : `${chunks} ${chunks === 1 ? "change" : "changes"}`}
        actions={
          <>
            <PasteButton onPaste={setOriginal} />
            <IconAction
              label="Swap Sides"
              onClick={() => {
                setOriginal(modified);
                setModified(original);
              }}
            >
              <ArrowLeftRight />
            </IconAction>
            <PasteButton onPaste={setModified} />
            <ClearButton
              onClear={() => {
                setOriginal("");
                setModified("");
              }}
              disabled={!original && !modified}
            />
          </>
        }
        fill
        padded={false}
      >
        <DiffEditor
          original={original}
          modified={modified}
          onOriginalChange={setOriginal}
          onModifiedChange={setModified}
          collapseUnchanged={collapse}
          onChunks={setChunks}
        />
      </ToolSection>
    </ToolPage>
  );
}
