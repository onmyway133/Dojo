import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { FolderOpen, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FileDropZone,
  ImagePreview,
  OptionSwitch,
  ResultList,
  ResultRow,
  StatusMessage,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Button } from "@/components/ui/button";
import { fileName, imageFilter, pickFolder, readFileBytes } from "@/lib/files";
import { call } from "@/lib/invoke";

interface IconSetResult {
  folder: string;
  files: string[];
  warning?: string;
}

export default function AppIconTool() {
  const [source, setSource] = useState<string>();
  const [preview, setPreview] = useState<string>();
  const [macos, setMacos] = usePersistentState("macos", true);
  const [ios, setIos] = usePersistentState("ios", true);
  const [result, setResult] = useState<IconSetResult>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!source) return;
    let url: string | undefined;
    readFileBytes(source)
      .then((bytes) => {
        url = URL.createObjectURL(new Blob([bytes as BlobPart]));
        setPreview(url);
      })
      .catch((e) => setError(String(e)));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [source]);

  async function generate() {
    if (!source) return;
    const outputDir = await pickFolder();
    if (!outputDir) return;
    const platforms = [macos && "macos", ios && "ios"].filter(Boolean);
    setBusy(true);
    setError(undefined);
    try {
      const set = await call<IconSetResult>("generate_app_icon", { source, outputDir, platforms });
      setResult(set);
      toast.success("Icon set created", { description: set.folder });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage layout="scroll">
      <ToolOptions>
        <OptionSwitch label="macOS" checked={macos} onChange={setMacos} />
        <OptionSwitch label="iOS" checked={ios} onChange={setIos} />
        <Button onClick={generate} disabled={!source || busy || (!macos && !ios)}>
          <Sparkles /> {busy ? "Generating…" : "Generate AppIcon.appiconset…"}
        </Button>
      </ToolOptions>
      <FileDropZone
        onFile={(path) => {
          setSource(path);
          setResult(undefined);
        }}
        filters={[imageFilter]}
        title="Drop a 1024×1024 image or click to choose"
        subtitle="PNG with no transparency works best for iOS"
        className="shrink-0"
      />
      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {source && preview && (
        <ToolSection title={fileName(source)} className="shrink-0">
          <ImagePreview src={preview} className="h-56" />
        </ToolSection>
      )}
      {result && (
        <ToolSection
          title="AppIcon.appiconset"
          meta={`${result.files.length} files`}
          actions={
            <Button variant="ghost" size="sm" onClick={() => revealItemInDir(result.folder)}>
              <FolderOpen /> Show in Finder
            </Button>
          }
        >
          {result.warning && <StatusMessage className="mb-3">{result.warning}</StatusMessage>}
          <ResultList>
            {result.files.map((file) => (
              <ResultRow key={file} label="File" value={file} mono />
            ))}
          </ResultList>
        </ToolSection>
      )}
    </ToolPage>
  );
}
