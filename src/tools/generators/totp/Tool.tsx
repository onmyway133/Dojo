import QRCode from "qrcode";
import { RefreshCw } from "lucide-react";
import {
  type Choice,
  CopyButton,
  FieldList,
  FieldRow,
  ImagePreview,
  Option,
  ResultList,
  ResultRow,
  Segmented,
  StatusMessage,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAsync } from "@/hooks/useAsync";
import { useNow } from "@/hooks/useNow";
import { decodeBase32, encodeBase32, otpauthUri, type TotpAlgorithm, totp, type TotpOptions } from "./logic";

const algorithmChoices: Choice<TotpAlgorithm>[] = [
  { value: "SHA-1", label: "SHA-1" },
  { value: "SHA-256", label: "SHA-256" },
  { value: "SHA-512", label: "SHA-512" },
];
const digitChoices: Choice<"6" | "8">[] = [
  { value: "6", label: "6" },
  { value: "8", label: "8" },
];
const periodChoices: Choice<"30" | "60">[] = [
  { value: "30", label: "30 s" },
  { value: "60", label: "60 s" },
];

function newSecret(): string {
  return encodeBase32(crypto.getRandomValues(new Uint8Array(20)));
}

// Made once per launch so a first visit starts with a working secret.
const firstSecret = newSecret();

function readKey(secret: string): { key?: Uint8Array; error?: string } {
  try {
    return { key: decodeBase32(secret) };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

/** Groups a code as "123 456" for reading; the copied value has no space. */
const spaced = (code: string) => code.replace(/(\d{3,4})(?=\d{3,4}$)/, "$1 ");

export default function TotpTool() {
  const [secret, setSecret] = usePersistentState("secret", firstSecret);
  const [issuer, setIssuer] = usePersistentState("issuer", "DevTools");
  const [account, setAccount] = usePersistentState("account", "me@example.com");
  const [algorithm, setAlgorithm] = usePersistentState<TotpAlgorithm>("algorithm", "SHA-1");
  const [digits, setDigits] = usePersistentState<"6" | "8">("digits", "6");
  const [period, setPeriod] = usePersistentState<"30" | "60">("period", "30");
  const options: TotpOptions = { algorithm, digits: Number(digits), period: Number(period) };

  const seconds = Math.floor(useNow().getTime() / 1000);
  const step = Math.floor(seconds / options.period);
  const remaining = options.period - (seconds % options.period);
  const { key, error } = readKey(secret);

  const codes = useAsync(
    () =>
      key
        ? Promise.all([-1, 0, 1].map((offset) => totp(key, (step + offset) * options.period, options)))
        : undefined,
    [secret, step, algorithm, digits, period],
  );
  const uri = key ? otpauthUri(secret, account, issuer, options) : "";
  const qr = useAsync(() => (uri ? QRCode.toDataURL(uri, { margin: 2, width: 320 }) : undefined), [uri]);
  const current = codes.status === "success" ? codes.value : undefined;

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Secret">
        <FieldList>
          <FieldRow label="Base32 secret" hint={error} error>
            <Input value={secret} onChange={(e) => setSecret(e.target.value)} spellCheck={false} autoComplete="off" className="max-w-96 font-mono text-[13px]" />
            <CopyButton value={secret} />
            <Button variant="ghost" size="sm" onClick={() => setSecret(newSecret())}>
              <RefreshCw /> New
            </Button>
          </FieldRow>
          <FieldRow label="Issuer">
            <Input value={issuer} onChange={(e) => setIssuer(e.target.value)} spellCheck={false} className="max-w-96" />
          </FieldRow>
          <FieldRow label="Account">
            <Input value={account} onChange={(e) => setAccount(e.target.value)} spellCheck={false} className="max-w-96" />
          </FieldRow>
        </FieldList>
      </ToolSection>
      <ToolOptions>
        <Option label="Algorithm">
          <Segmented value={algorithm} onChange={setAlgorithm} choices={algorithmChoices} />
        </Option>
        <Option label="Digits">
          <Segmented value={digits} onChange={setDigits} choices={digitChoices} />
        </Option>
        <Option label="Period">
          <Segmented value={period} onChange={setPeriod} choices={periodChoices} />
        </Option>
      </ToolOptions>
      {codes.status === "error" && <StatusMessage tone="error">{codes.error}</StatusMessage>}
      {current && (
        <ToolSection title="Current Code" meta={`Changes in ${remaining} s`} actions={<CopyButton value={current[1]} />}>
          <div className="font-mono text-4xl font-semibold tracking-wider tabular-nums select-text">{spaced(current[1])}</div>
          <div className="ds-slider-track mt-3 h-1 max-w-96 overflow-hidden rounded-full">
            <div
              className="ds-slider-range h-full rounded-full transition-[width] duration-1000 ease-linear"
              style={{ width: `${(remaining / options.period) * 100}%` }}
            />
          </div>
          <div className="mt-3">
            <ResultList>
              <ResultRow label="Previous" value={current[0]} mono />
              <ResultRow label="Next" value={current[2]} mono />
            </ResultList>
          </div>
        </ToolSection>
      )}
      {uri && (
        <ToolSection title="Authenticator Setup" actions={<CopyButton label="Copy URI" value={uri} />}>
          <div className="flex flex-wrap items-start gap-4">
            {qr.status === "success" && <ImagePreview src={qr.value} alt="otpauth QR code" className="m-0 size-48 min-h-0 shrink-0" />}
            <p className="min-w-0 flex-1 font-mono text-[12.5px] [overflow-wrap:anywhere] select-text">{uri}</p>
          </div>
        </ToolSection>
      )}
    </ToolPage>
  );
}
