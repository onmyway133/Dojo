import { useState } from "react";
import {
  FieldList,
  FieldRow,
  ResultList,
  ResultRow,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useAsync } from "@/hooks/useAsync";
import { useDebounced } from "@/hooks/useDebounced";
import { call } from "@/lib/invoke";

export default function BcryptTool() {
  // Passwords are kept in memory only, never in saved tool state.
  const [password, setPassword] = useState("");
  const [cost, setCost] = usePersistentState("cost", 10);
  const [hash, setHash] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const [checkPassword, setCheckPassword] = useState("");
  const [checkHash, setCheckHash] = usePersistentState("checkHash", "");
  const debounced = useDebounced(`${checkPassword}\u0000${checkHash}`, 250);
  const verdict = useAsync(() => {
    const [p, h] = debounced.split("\u0000");
    return p && h.trim() ? call<boolean>("bcrypt_verify", { password: p, hash: h }) : undefined;
  }, [debounced]);

  async function generate() {
    setBusy(true);
    setError(undefined);
    try {
      setHash(await call<string>("bcrypt_hash", { password, cost }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Hash">
        <FieldList>
          <FieldRow label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password to hash" className="font-mono text-[13px]" />
          </FieldRow>
          <FieldRow label={`Cost ${cost}`} hint="Each step doubles the work. 10–12 is typical for login systems.">
            <Slider value={[cost]} min={4} max={14} step={1} onValueChange={([c]) => setCost(c)} className="max-w-64" />
          </FieldRow>
        </FieldList>
        <div className="mt-3 flex items-center gap-3 pl-35">
          <Button onClick={generate} disabled={!password || busy}>{busy ? "Hashing…" : "Generate Hash"}</Button>
        </div>
        {error && <StatusMessage tone="error" className="mt-3">{error}</StatusMessage>}
        {hash && (
          <div className="mt-3">
            <ResultList>
              <ResultRow label="Hash" value={hash} mono />
            </ResultList>
          </div>
        )}
      </ToolSection>

      <ToolSection title="Verify">
        <FieldList>
          <FieldRow label="Password">
            <Input type="password" value={checkPassword} onChange={(e) => setCheckPassword(e.target.value)} className="font-mono text-[13px]" />
          </FieldRow>
          <FieldRow label="Hash">
            <Input value={checkHash} onChange={(e) => setCheckHash(e.target.value)} placeholder="$2b$10$…" spellCheck={false} className="font-mono text-[13px]" />
            {verdict.status === "success" &&
              (verdict.value ? <Badge>Match</Badge> : <Badge variant="destructive">No match</Badge>)}
          </FieldRow>
        </FieldList>
        {verdict.status === "error" && <StatusMessage tone="error" className="mt-3">{verdict.error}</StatusMessage>}
      </ToolSection>
    </ToolPage>
  );
}
