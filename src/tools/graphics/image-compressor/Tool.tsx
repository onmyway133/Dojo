import { save } from "@tauri-apps/plugin-dialog";
import { FileMinus2 } from "lucide-react";
import { useState } from "react";
import {
  type Choice,
  FileDropZone,
  ImagePreview,
  Option,
  Segmented,
  StatusMessage,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { fileName } from "@/lib/files";
import { call } from "@/lib/invoke";
import { SavedResult } from "@/tools/shared/SavedResult";
import { formatBytes } from "@/tools/shared/text";
import { useImageFile, type WriteResult } from "@/tools/shared/useImageFile";

type Level = "2" | "4" | "6";
const levelChoices: Choice<Level>[] = [
  { value: "2", label: "Fast" },
  { value: "4", label: "Thorough" },
  { value: "6", label: "Maximum" },
];

export default function ImageCompressorTool() {
  const image = useImageFile();
  const [level, setLevel] = usePersistentState<Level>("level", "2");
  const [quality, setQuality] = usePersistentState("quality", 80);
  const [saved, setSaved] = useState<{ path: string; result: WriteResult }>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const isJpeg = image.info?.format === "JPEG";

  async function compress() {
    if (!image.path) return;
    const name = fileName(image.path);
    const dot = name.lastIndexOf(".");
    const dest = await save({ defaultPath: `${name.slice(0, dot)}-compressed${name.slice(dot)}` });
    if (!dest) return;
    setBusy(true);
    setError(undefined);
    try {
      setSaved({ path: dest, result: await call<WriteResult>("compress_image", { source: image.path, dest, level: Number(level), quality }) });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage layout="scroll">
      <ToolOptions>
        <Option label="PNG effort">
          <Segmented value={level} onChange={setLevel} choices={levelChoices} />
        </Option>
        <Option label={`JPEG quality ${quality}`}>
          <Slider value={[quality]} min={30} max={100} step={1} onValueChange={([q]) => setQuality(q)} className="w-36" />
        </Option>
        <Button onClick={compress} disabled={!image.info || busy}>
          <FileMinus2 /> {busy ? "Compressing…" : "Compress & Save…"}
        </Button>
      </ToolOptions>
      <FileDropZone
        onFile={(p) => { image.setPath(p); setSaved(undefined); }}
        filters={[{ name: "PNG or JPEG", extensions: ["png", "jpg", "jpeg"] }]}
        title="Drop a PNG or JPEG, or click to choose"
        subtitle="PNG is optimised losslessly; JPEG is re-encoded at the chosen quality"
        className="shrink-0"
      />
      {(image.error || error) && <StatusMessage tone="error">{image.error ?? error}</StatusMessage>}
      {image.path && image.info && image.preview && (
        <ToolSection
          title={fileName(image.path)}
          meta={`${image.info.format} · ${image.info.width} × ${image.info.height} · ${formatBytes(image.info.bytes)}${isJpeg ? " · lossy" : ""}`}
          className="shrink-0"
        >
          <ImagePreview src={image.preview} className="h-64" />
        </ToolSection>
      )}
      {saved && <SavedResult path={saved.path} result={saved.result} />}
    </ToolPage>
  );
}
