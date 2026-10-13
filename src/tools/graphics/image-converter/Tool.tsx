import { save } from "@tauri-apps/plugin-dialog";
import { ImageDown } from "lucide-react";
import { useState } from "react";
import {
  type Choice,
  FileDropZone,
  ImagePreview,
  Option,
  OptionSelect,
  OptionSwitch,
  StatusMessage,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { fileName, imageFilter } from "@/lib/files";
import { call } from "@/lib/invoke";
import { SavedResult } from "@/tools/shared/SavedResult";
import { formatBytes } from "@/tools/shared/text";
import { useImageFile, type WriteResult } from "@/tools/shared/useImageFile";

type Format = "png" | "jpeg" | "webp" | "tiff" | "gif" | "bmp" | "ico";
const formatChoices: Choice<Format>[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WebP (lossless)" },
  { value: "tiff", label: "TIFF" },
  { value: "gif", label: "GIF" },
  { value: "bmp", label: "BMP" },
  { value: "ico", label: "ICO" },
];
const extensions: Record<Format, string> = { png: "png", jpeg: "jpg", webp: "webp", tiff: "tiff", gif: "gif", bmp: "bmp", ico: "ico" };

export default function ImageConverterTool() {
  const image = useImageFile();
  const [format, setFormat] = usePersistentState<Format>("format", "png");
  const [quality, setQuality] = usePersistentState("quality", 85);
  const [resize, setResize] = usePersistentState("resize", false);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [saved, setSaved] = useState<{ path: string; result: WriteResult }>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function convert() {
    if (!image.path) return;
    const base = fileName(image.path).replace(/\.[^.]+$/, "");
    const dest = await save({ defaultPath: `${base}.${extensions[format]}`, filters: [{ name: format.toUpperCase(), extensions: [extensions[format]] }] });
    if (!dest) return;
    setBusy(true);
    setError(undefined);
    try {
      const options = {
        format,
        quality,
        width: resize && width ? Number(width) : null,
        height: resize && height ? Number(height) : null,
      };
      setSaved({ path: dest, result: await call<WriteResult>("convert_image", { source: image.path, dest, options }) });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage layout="scroll">
      <ToolOptions>
        <Option label="Format">
          <OptionSelect value={format} onChange={setFormat} choices={formatChoices} />
        </Option>
        {format === "jpeg" && (
          <Option label={`Quality ${quality}`}>
            <Slider value={[quality]} min={10} max={100} step={1} onValueChange={([q]) => setQuality(q)} className="w-36" />
          </Option>
        )}
        <OptionSwitch label="Resize" checked={resize} onChange={setResize} />
        {resize && (
          <Option label="Size">
            <Input value={width} onChange={(e) => setWidth(e.target.value.replace(/\D/g, ""))} placeholder="Width" className="h-7 w-20 text-[13px]" />
            <span className="text-muted-foreground">×</span>
            <Input value={height} onChange={(e) => setHeight(e.target.value.replace(/\D/g, ""))} placeholder="Height" className="h-7 w-20 text-[13px]" />
          </Option>
        )}
        <Button onClick={convert} disabled={!image.info || busy}>
          <ImageDown /> {busy ? "Converting…" : "Convert & Save…"}
        </Button>
      </ToolOptions>
      <FileDropZone onFile={(p) => { image.setPath(p); setSaved(undefined); }} filters={[imageFilter]} title="Drop an image or click to choose" className="shrink-0" />
      {(image.error || error) && <StatusMessage tone="error">{image.error ?? error}</StatusMessage>}
      {resize && <p className="-mt-2 text-xs text-muted-foreground">Leave one side empty to keep the aspect ratio.</p>}
      {image.path && image.info && image.preview && (
        <ToolSection
          title={fileName(image.path)}
          meta={`${image.info.format} · ${image.info.width} × ${image.info.height} · ${formatBytes(image.info.bytes)}`}
          className="shrink-0"
        >
          <ImagePreview src={image.preview} className="h-64" />
        </ToolSection>
      )}
      {saved && <SavedResult path={saved.path} result={saved.result} />}
    </ToolPage>
  );
}
