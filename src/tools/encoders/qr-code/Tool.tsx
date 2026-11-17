import jsQR from "jsqr";
import { Download } from "lucide-react";
import QRCode from "qrcode";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import {
  type Choice,
  CodeEditor,
  CopyButton,
  FileDropZone,
  ImagePreview,
  InputActions,
  Option,
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
import { useDebounced } from "@/hooks/useDebounced";
import { fileName, imageFilter, readFileBytes, saveBytes } from "@/lib/files";
import { decodeBase64 } from "@/tools/shared/base64";
import { imagePixels } from "@/tools/shared/image";

type Mode = "generate" | "read";
type Level = "L" | "M" | "Q" | "H";
type Size = "256" | "512" | "1024";

const modeChoices: Choice<Mode>[] = [
  { value: "generate", label: "Generate" },
  { value: "read", label: "Read" },
];
const levelChoices: Choice<Level>[] = [
  { value: "L", label: "Low" },
  { value: "M", label: "Medium" },
  { value: "Q", label: "Quartile" },
  { value: "H", label: "High" },
];
const sizeChoices: Choice<Size>[] = [
  { value: "256", label: "256" },
  { value: "512", label: "512" },
  { value: "1024", label: "1024" },
];

function GeneratePanel({ modePicker }: { modePicker: ReactNode }) {
  const [text, setText] = usePersistentState("text", "https://example.com");
  const [level, setLevel] = usePersistentState<Level>("level", "M");
  const [size, setSize] = usePersistentState<Size>("size", "512");
  const debounced = useDebounced(text, 150);

  const qr = useAsync(async () => {
    if (!debounced) return undefined;
    const options = { errorCorrectionLevel: level, margin: 2, width: Number(size) };
    const [png, svg] = await Promise.all([QRCode.toDataURL(debounced, options), QRCode.toString(debounced, { ...options, type: "svg" })]);
    return { png, svg };
  }, [debounced, level, size]);

  async function savePng() {
    if (qr.status !== "success" || !qr.value) return;
    const path = await saveBytes(decodeBase64(qr.value.png.split(",")[1]), "qr-code.png", [{ name: "PNG", extensions: ["png"] }]);
    if (path) toast.success("QR code saved", { description: path });
  }

  const value = qr.status === "success" ? qr.value : undefined;
  return (
    <>
      <ToolOptions>
        {modePicker}
        <Option label="Error correction">
          <Segmented value={level} onChange={setLevel} choices={levelChoices} />
        </Option>
        <Option label="Size">
          <Segmented value={size} onChange={setSize} choices={sizeChoices} />
        </Option>
      </ToolOptions>
      <SplitView>
        <ToolSection title="Content" actions={<InputActions value={text} onChange={setText} />} padded={false} fill>
          <CodeEditor value={text} onChange={setText} lineNumbers={false} placeholder="Text or URL to encode" />
        </ToolSection>
        <ToolSection
          title="QR Code"
          meta={value ? `${size} × ${size} px` : undefined}
          actions={
            value && (
              <>
                <CopyButton label="Copy SVG" value={value.svg} />
                <Button variant="ghost" size="sm" onClick={savePng}>
                  <Download /> Save PNG
                </Button>
              </>
            )
          }
          fill
        >
          {qr.status === "error" && <StatusMessage tone="error">{qr.error}</StatusMessage>}
          {value && <ImagePreview src={value.png} alt="QR code" className="min-h-0 flex-1" />}
        </ToolSection>
      </SplitView>
    </>
  );
}

interface ReadResult {
  name: string;
  src: string;
  text?: string;
}

function ReadPanel({ modePicker }: { modePicker: ReactNode }) {
  const [result, setResult] = useState<ReadResult>();

  async function read(path: string) {
    try {
      const bytes = await readFileBytes(path);
      const blob = new Blob([bytes as BlobPart]);
      const pixels = await imagePixels(blob);
      const code = jsQR(pixels.data, pixels.width, pixels.height);
      if (result) URL.revokeObjectURL(result.src);
      setResult({ name: fileName(path), src: URL.createObjectURL(blob), text: code?.data });
    } catch (error) {
      toast.error("Couldn't read the image", { description: String(error) });
    }
  }

  return (
    <>
      <ToolOptions>{modePicker}</ToolOptions>
      <FileDropZone onFile={read} filters={[imageFilter]} title="Drop an image with a QR code, or click to choose" className="shrink-0 py-6" />
      {result && (
        <SplitView>
          <ToolSection title={result.name} fill>
            <ImagePreview src={result.src} className="min-h-0 flex-1" />
          </ToolSection>
          <ToolSection title="Decoded Text" actions={result.text ? <CopyButton value={result.text} /> : undefined} padded={false} fill>
            {result.text ? (
              <CodeEditor value={result.text} readOnly lineNumbers={false} />
            ) : (
              <StatusMessage tone="error" className="mx-4">No QR code found in this image.</StatusMessage>
            )}
          </ToolSection>
        </SplitView>
      )}
    </>
  );
}

export default function QrCodeTool() {
  const [mode, setMode] = usePersistentState<Mode>("mode", "generate");
  const modePicker = (
    <Option label="Mode">
      <Segmented value={mode} onChange={setMode} choices={modeChoices} />
    </Option>
  );
  return (
    <ToolPage>
      {mode === "generate" ? <GeneratePanel modePicker={modePicker} /> : <ReadPanel modePicker={modePicker} />}
    </ToolPage>
  );
}
