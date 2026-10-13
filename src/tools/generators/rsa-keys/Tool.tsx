import { Download, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Choice,
  CodeEditor,
  CopyButton,
  IconAction,
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
import { saveBytes } from "@/lib/files";
import { call } from "@/lib/invoke";

type Bits = "2048" | "3072" | "4096";
const bitChoices: Choice<Bits>[] = ["2048", "3072", "4096"].map((v) => ({ value: v as Bits, label: `${v} bits` }));

interface KeyPair {
  privatePem: string;
  publicPem: string;
  bits: number;
}

async function save(pem: string, name: string) {
  const path = await saveBytes(new TextEncoder().encode(pem), name, [{ name: "PEM", extensions: ["pem"] }]);
  if (path) toast.success("Key saved", { description: path });
}

export default function RsaKeysTool() {
  const [bits, setBits] = usePersistentState<Bits>("bits", "2048");
  const [pair, setPair] = useState<KeyPair>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function generate() {
    setBusy(true);
    setError(undefined);
    try {
      setPair(await call<KeyPair>("generate_rsa_keys", { bits: Number(bits) }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage>
      <ToolOptions>
        <Option label="Key size">
          <Segmented value={bits} onChange={setBits} choices={bitChoices} />
        </Option>
        <Button onClick={generate} disabled={busy}>
          <KeyRound /> {busy ? "Generating…" : "Generate Key Pair"}
        </Button>
        <span className="text-xs text-muted-foreground">Keys are generated on this Mac and never leave it.</span>
      </ToolOptions>
      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      <SplitView>
        <ToolSection
          title="Private Key"
          meta="PKCS#8"
          actions={
            pair && (
              <>
                <CopyButton value={pair.privatePem} />
                <IconAction label="Save" onClick={() => save(pair.privatePem, "private.pem")}>
                  <Download />
                </IconAction>
              </>
            )
          }
          fill
          padded={false}
        >
          <CodeEditor value={pair?.privatePem ?? ""} readOnly lineNumbers={false} placeholder="Generate a key pair" />
        </ToolSection>
        <ToolSection
          title="Public Key"
          meta="SPKI"
          actions={
            pair && (
              <>
                <CopyButton value={pair.publicPem} />
                <IconAction label="Save" onClick={() => save(pair.publicPem, "public.pem")}>
                  <Download />
                </IconAction>
              </>
            )
          }
          fill
          padded={false}
        >
          <CodeEditor value={pair?.publicPem ?? ""} readOnly lineNumbers={false} />
        </ToolSection>
      </SplitView>
    </ToolPage>
  );
}
