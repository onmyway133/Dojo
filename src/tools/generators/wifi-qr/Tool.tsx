import { Download } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  type Choice,
  CopyButton,
  FieldList,
  FieldRow,
  ImagePreview,
  Segmented,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAsync } from "@/hooks/useAsync";
import { useDebounced } from "@/hooks/useDebounced";
import { saveBytes } from "@/lib/files";
import { decodeBase64 } from "@/tools/shared/base64";
import { type WifiNetwork, type WifiSecurity, wifiPayload } from "./logic";

const securityChoices: Choice<WifiSecurity>[] = [
  { value: "WPA", label: "WPA / WPA2 / WPA3" },
  { value: "WEP", label: "WEP" },
  { value: "nopass", label: "None" },
];

function payloadOf(network: WifiNetwork): { value?: string; error?: string } {
  try {
    return { value: wifiPayload(network) };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export default function WifiQrTool() {
  const [network, setNetwork] = usePersistentState<WifiNetwork>("network", {
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false,
  });
  const set = (patch: Partial<WifiNetwork>) => setNetwork((n) => ({ ...n, ...patch }));
  const payload = payloadOf(useDebounced(network, 150));
  const qr = useAsync(
    () => (payload.value ? QRCode.toDataURL(payload.value, { margin: 2, width: 512, errorCorrectionLevel: "M" }) : undefined),
    [payload.value],
  );

  async function savePng() {
    if (qr.status !== "success") return;
    const name = `wifi-${network.ssid.replace(/[^\w-]+/g, "-") || "network"}.png`;
    const path = await saveBytes(decodeBase64(qr.value.split(",")[1]), name, [{ name: "PNG", extensions: ["png"] }]);
    if (path) toast.success("QR code saved", { description: path });
  }

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Network">
        <FieldList>
          <FieldRow label="Network name">
            <Input value={network.ssid} onChange={(e) => set({ ssid: e.target.value })} placeholder="SSID" spellCheck={false} className="max-w-80" />
          </FieldRow>
          <FieldRow label="Security">
            <Segmented value={network.security} onChange={(security) => set({ security })} choices={securityChoices} />
          </FieldRow>
          {network.security !== "nopass" && (
            <FieldRow label="Password">
              <Input value={network.password} onChange={(e) => set({ password: e.target.value })} spellCheck={false} autoComplete="off" className="max-w-80" />
            </FieldRow>
          )}
          <FieldRow label="Hidden network">
            <Switch checked={network.hidden} onCheckedChange={(hidden) => set({ hidden })} className="mt-1.5" />
          </FieldRow>
        </FieldList>
      </ToolSection>
      <ToolSection
        title="QR Code"
        actions={
          qr.status === "success" && (
            <>
              <CopyButton label="Copy Text" value={payload.value ?? ""} />
              <Button variant="ghost" size="sm" onClick={savePng}>
                <Download /> Save PNG
              </Button>
            </>
          )
        }
      >
        {payload.error && <p className="text-[13px] text-muted-foreground">{payload.error} to make the code.</p>}
        {qr.status === "error" && <StatusMessage tone="error">{qr.error}</StatusMessage>}
        {payload.value && qr.status === "success" && <ImagePreview src={qr.value} alt="Wi-Fi QR code" className="m-0 size-64 min-h-0" />}
      </ToolSection>
    </ToolPage>
  );
}
