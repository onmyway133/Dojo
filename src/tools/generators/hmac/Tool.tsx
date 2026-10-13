import {
  type Choice,
  CodeEditor,
  FieldList,
  FieldRow,
  InputActions,
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
import { Input } from "@/components/ui/input";
import { useAsync } from "@/hooks/useAsync";
import { useDebounced } from "@/hooks/useDebounced";
import { call } from "@/lib/invoke";

type Algorithm = "sha1" | "sha256" | "sha384" | "sha512";
const algorithmChoices: Choice<Algorithm>[] = [
  { value: "sha256", label: "SHA-256" },
  { value: "sha384", label: "SHA-384" },
  { value: "sha512", label: "SHA-512" },
  { value: "sha1", label: "SHA-1" },
];

export default function HmacTool() {
  const [message, setMessage] = usePersistentState("message", "");
  const [key, setKey] = usePersistentState("key", "");
  const [algorithm, setAlgorithm] = usePersistentState<Algorithm>("algorithm", "sha256");
  const debounced = useDebounced(`${algorithm}\u0000${key}\u0000${message}`, 150);

  const mac = useAsync(() => {
    const [alg, k, m] = debounced.split("\u0000");
    return k ? call<{ hex: string; base64: string }>("hmac", { algorithm: alg, key: k, message: m }) : undefined;
  }, [debounced]);

  return (
    <ToolPage>
      <ToolOptions>
        <Option label="Algorithm">
          <Segmented value={algorithm} onChange={setAlgorithm} choices={algorithmChoices} />
        </Option>
      </ToolOptions>
      <ToolSection title="Secret Key" className="shrink-0">
        <FieldList>
          <FieldRow label="Key" hint="Used as UTF-8 bytes">
            <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Secret" spellCheck={false} className="font-mono text-[13px]" />
          </FieldRow>
        </FieldList>
      </ToolSection>
      <ToolSection
        title="Message"
        actions={<InputActions value={message} onChange={setMessage} sample='{"event":"push","id":42}' />}
        fill
        padded={false}
        className="min-h-32"
      >
        <CodeEditor value={message} onChange={setMessage} lineNumbers={false} placeholder="Message to sign" />
      </ToolSection>
      <ToolSection title="Signature" className="shrink-0">
        {!key && <p className="text-[13px] text-muted-foreground">Enter a key to compute the HMAC.</p>}
        {mac.status === "error" && <StatusMessage tone="error">{mac.error}</StatusMessage>}
        {key && (mac.status === "success" || mac.status === "loading") && mac.value && (
          <ResultList>
            <ResultRow label="Hex" value={mac.value.hex} mono />
            <ResultRow label="Base64" value={mac.value.base64} mono />
          </ResultList>
        )}
      </ToolSection>
    </ToolPage>
  );
}
