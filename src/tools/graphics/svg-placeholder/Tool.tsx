import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  Chip,
  FieldList,
  FieldRow,
  ImagePreview,
  ResultList,
  ResultRow,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveBytes } from "@/lib/files";
import { defaultFontSize, type PlaceholderOptions, placeholderSvg, svgDataUri } from "./logic";

const presets: [number, number, string][] = [
  [1200, 630, "Social card"],
  [1920, 1080, "Full HD"],
  [800, 600, "4:3"],
  [512, 512, "Square"],
  [300, 250, "Banner"],
  [1170, 2532, "Phone"],
];

type Settings = Omit<PlaceholderOptions, "fontSize"> & { fontSize: number | null };

function build(settings: Settings) {
  try {
    const fontSize = settings.fontSize ?? defaultFontSize(settings.width, settings.height);
    const svg = placeholderSvg({ ...settings, fontSize });
    return { svg, uri: svgDataUri(svg) };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

/** Draws the SVG onto a canvas at its own size and returns PNG bytes. */
async function toPng(uri: string, width: number, height: number): Promise<Uint8Array> {
  const image = new Image();
  image.src = uri;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't encode PNG"))), "image/png"),
  );
  return new Uint8Array(await blob.arrayBuffer());
}

function ColorField({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  return (
    <>
      <label className="relative size-7 shrink-0 overflow-hidden rounded-md" style={{ background: value }} title={`Pick ${label}`}>
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-default opacity-0"
          aria-label={`Pick ${label}`}
        />
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} className="max-w-36 font-mono text-[13px]" />
    </>
  );
}

export default function SvgPlaceholderTool() {
  const [settings, setSettings] = usePersistentState<Settings>("settings", {
    width: 1200,
    height: 630,
    background: "#e5e5ea",
    foreground: "#8e8e93",
    text: "",
    fontSize: null,
  });
  const set = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));
  const result = build(settings);
  const number = (text: string) => Math.max(0, Math.min(10000, Math.round(Number(text) || 0)));

  async function save(kind: "svg" | "png") {
    if (!result.svg) return;
    const name = `placeholder-${settings.width}x${settings.height}.${kind}`;
    try {
      const bytes =
        kind === "svg" ? new TextEncoder().encode(result.svg) : await toPng(result.uri, settings.width, settings.height);
      const path = await saveBytes(bytes, name, [{ name: kind.toUpperCase(), extensions: [kind] }]);
      if (path) toast.success("Image saved", { description: path });
    } catch (error) {
      toast.error("Couldn't save the image", { description: String(error) });
    }
  }

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Image">
        <FieldList>
          <FieldRow label="Size">
            <Input value={settings.width} onChange={(e) => set({ width: number(e.target.value) })} inputMode="numeric" className="w-24 font-mono text-[13px]" aria-label="Width" />
            <span className="px-1 text-muted-foreground">×</span>
            <Input value={settings.height} onChange={(e) => set({ height: number(e.target.value) })} inputMode="numeric" className="w-24 font-mono text-[13px]" aria-label="Height" />
          </FieldRow>
          <FieldRow label="Presets">
            <div className="flex flex-wrap gap-1.5">
              {presets.map(([width, height, name]) => (
                <Chip key={name} selected={settings.width === width && settings.height === height} onClick={() => set({ width, height })}>
                  {name} <span className="tabular-nums opacity-60">{width}×{height}</span>
                </Chip>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="Background">
            <ColorField label="background" value={settings.background} onChange={(background) => set({ background })} />
          </FieldRow>
          <FieldRow label="Text color">
            <ColorField label="text color" value={settings.foreground} onChange={(foreground) => set({ foreground })} />
          </FieldRow>
          <FieldRow label="Text">
            <Input value={settings.text} onChange={(e) => set({ text: e.target.value })} placeholder={`${settings.width} × ${settings.height}`} className="max-w-80" />
          </FieldRow>
          <FieldRow label="Font size">
            <Input
              value={settings.fontSize ?? ""}
              onChange={(e) => set({ fontSize: e.target.value.trim() ? number(e.target.value) : null })}
              placeholder={`Auto (${defaultFontSize(settings.width, settings.height)})`}
              inputMode="numeric"
              className="w-32 font-mono text-[13px]"
            />
          </FieldRow>
        </FieldList>
      </ToolSection>
      {result.error && <StatusMessage tone="error">{result.error}</StatusMessage>}
      {result.svg && (
        <>
          <ToolSection
            title="Preview"
            meta={`${settings.width} × ${settings.height} px`}
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={() => save("svg")}>
                  <Download /> Save SVG
                </Button>
                <Button variant="ghost" size="sm" onClick={() => save("png")}>
                  <Download /> Save PNG
                </Button>
              </>
            }
          >
            <ImagePreview src={result.uri} alt="Placeholder preview" className="m-0 h-64" />
          </ToolSection>
          <ToolSection title="Code">
            <ResultList>
              <ResultRow label="SVG" value={result.svg} mono display={<span className="line-clamp-2">{result.svg}</span>} />
              <ResultRow label="Data URI" value={result.uri} mono display={<span className="line-clamp-2">{result.uri}</span>} />
              <ResultRow label="img tag" value={`<img src="${result.uri}" width="${settings.width}" height="${settings.height}" alt="">`} mono display={<span className="line-clamp-2">{`<img src="…" width="${settings.width}" height="${settings.height}" alt="">`}</span>} />
              <ResultRow label="CSS" value={`background-image: url("${result.uri}");`} mono display={<span className="line-clamp-2">{`background-image: url("…");`}</span>} />
            </ResultList>
          </ToolSection>
        </>
      )}
    </ToolPage>
  );
}
