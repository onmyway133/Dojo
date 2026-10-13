import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type Choice,
  CodeEditor,
  CopyButton,
  FileDropZone,
  ImagePreview,
  InputActions,
  Option,
  ResultList,
  ResultRow,
  Segmented,
  SplitView,
  StatusMessage,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Button } from "@/components/ui/button";
import { useAsync } from "@/hooks/useAsync";
import { fileName, imageFilter, mimeTypeFor, readFileBytes, saveBytes } from "@/lib/files";
import { decodeBase64, encodeBase64 } from "@/tools/shared/base64";
import { extensionFor, imageSize, sniffImageType } from "@/tools/shared/image";
import { formatBytes } from "@/tools/shared/text";

type Mode = "encode" | "decode";
const modeChoices: Choice<Mode>[] = [
  { value: "encode", label: "Image → Base64" },
  { value: "decode", label: "Base64 → Image" },
];

interface Encoded {
  name: string;
  mime: string;
  size: number;
  base64: string;
}

function EncodePanel() {
  // Images can be megabytes of text, so they stay in memory instead of tool state.
  const [encoded, setEncoded] = useState<Encoded>();
  const dataUri = encoded ? `data:${encoded.mime};base64,${encoded.base64}` : "";
  const size = useAsync(() => (dataUri ? imageSize(dataUri) : undefined), [dataUri]);

  async function load(path: string) {
    try {
      const bytes = await readFileBytes(path);
      setEncoded({ name: fileName(path), mime: sniffImageType(bytes) ?? mimeTypeFor(path), size: bytes.length, base64: encodeBase64(bytes) });
    } catch (error) {
      toast.error("Couldn't read the image", { description: String(error) });
    }
  }

  return (
    <>
      <FileDropZone onFile={load} filters={[imageFilter]} title="Drop an image or click to choose" subtitle="PNG, JPEG, GIF, WebP, SVG, ICO" className="shrink-0 py-6" />
      {encoded && (
        <SplitView>
          <ToolSection title={encoded.name} meta={formatBytes(encoded.size)} className="min-h-64">
            <ImagePreview src={dataUri} alt={encoded.name} className="min-h-0 flex-1" />
            <ResultList>
              <ResultRow label="Type" value={encoded.mime} />
              <ResultRow label="Dimensions" value={size.status === "success" ? `${size.value.width} × ${size.value.height}` : ""} />
              <ResultRow label="Base64 length" value={`${encoded.base64.length.toLocaleString()} characters`} />
            </ResultList>
          </ToolSection>
          <ToolSection title="Data URI" actions={<CopyButton value={dataUri} />} padded={false} fill>
            <CodeEditor value={dataUri} readOnly lineNumbers={false} />
            <div className="flex flex-wrap gap-1 px-3 pb-3">
              <CopyButton label="Copy Base64 Only" value={encoded.base64} />
              <CopyButton label="Copy CSS" value={`background-image: url("${dataUri}");`} />
              <CopyButton label="Copy HTML" value={`<img src="${dataUri}" alt="" />`} />
              <CopyButton label="Copy Markdown" value={`![](${dataUri})`} />
            </div>
          </ToolSection>
        </SplitView>
      )}
    </>
  );
}

function DecodePanel() {
  const [input, setInput] = usePersistentState("decodeInput", "");

  const decoded = useMemo(() => {
    const text = input.trim();
    if (!text) return undefined;
    try {
      const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(text);
      const bytes = decodeBase64(match ? match[3] : text);
      const mime = sniffImageType(bytes) ?? match?.[1];
      if (!mime) throw new Error("The decoded bytes don't look like an image");
      return { ok: true as const, bytes, mime, src: URL.createObjectURL(new Blob([bytes as BlobPart], { type: mime })) };
    } catch (error) {
      return { ok: false as const, error: (error as Error).message };
    }
  }, [input]);

  useEffect(() => () => { if (decoded?.ok) URL.revokeObjectURL(decoded.src); }, [decoded]);

  async function save() {
    if (!decoded?.ok) return;
    const path = await saveBytes(decoded.bytes, `image.${extensionFor(decoded.mime)}`);
    if (path) toast.success("Image saved", { description: path });
  }

  return (
    <SplitView>
      <ToolSection title="Base64 or Data URI" actions={<InputActions value={input} onChange={setInput} />} padded={false} fill>
        <CodeEditor value={input} onChange={setInput} lineNumbers={false} placeholder="data:image/png;base64,iVBORw0KGgo…" />
      </ToolSection>
      <ToolSection
        title="Image"
        meta={decoded?.ok ? `${decoded.mime} · ${formatBytes(decoded.bytes.length)}` : undefined}
        actions={
          decoded?.ok && (
            <Button variant="ghost" size="sm" onClick={save}>
              <Download /> Save
            </Button>
          )
        }
        fill
      >
        {decoded?.ok && <ImagePreview src={decoded.src} className="min-h-0 flex-1" />}
        {decoded && !decoded.ok && <StatusMessage tone="error">{decoded.error}</StatusMessage>}
        {!decoded && <p className="text-[13px] text-muted-foreground">The image appears here.</p>}
      </ToolSection>
    </SplitView>
  );
}

export default function Base64ImageTool() {
  const [mode, setMode] = usePersistentState<Mode>("mode", "encode");
  return (
    <ToolPage>
      <ToolOptions>
        <Option label="Mode">
          <Segmented value={mode} onChange={setMode} choices={modeChoices} />
        </Option>
      </ToolOptions>
      {mode === "encode" ? <EncodePanel /> : <DecodePanel />}
    </ToolPage>
  );
}
