import { json } from "@codemirror/lang-json";
import { useDeferredValue, useMemo } from "react";
import {
  CodeEditor,
  CopyButton,
  InputActions,
  ResultList,
  ResultRow,
  SplitView,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAsync } from "@/hooks/useAsync";
import { canVerify, decodeJwt, expiryState, registeredClaims, verifyHmac } from "./logic";

const jsonLanguage = json();
const sample =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" });

function claimValue(key: string, value: unknown): string {
  if ((key === "exp" || key === "iat" || key === "nbf") && typeof value === "number") {
    return `${dateTime.format(new Date(value * 1000))} (${value})`;
  }
  return typeof value === "string" ? value : JSON.stringify(value);
}

const expiryBadge = {
  valid: { label: "Not expired", variant: "secondary" as const },
  expired: { label: "Expired", variant: "destructive" as const },
  "not-yet": { label: "Not yet valid", variant: "destructive" as const },
  "no-expiry": { label: "No expiry", variant: "secondary" as const },
};

export default function JwtDecoderTool() {
  const [token, setToken] = usePersistentState("token", "");
  const [secret, setSecret] = usePersistentState("secret", "");
  const deferred = useDeferredValue(token);

  const decoded = useMemo(() => {
    if (!deferred.trim()) return undefined;
    try {
      return { ok: true as const, jwt: decodeJwt(deferred) };
    } catch (error) {
      return { ok: false as const, error: (error as Error).message };
    }
  }, [deferred]);

  const jwt = decoded?.ok ? decoded.jwt : undefined;
  const alg = jwt?.header.alg;
  const verification = useAsync(
    () => (jwt && secret && canVerify(alg) ? verifyHmac(deferred, secret, alg as string) : undefined),
    [deferred, secret, alg],
  );
  const expiry = jwt ? expiryState(jwt.payload) : undefined;
  const headerText = jwt ? JSON.stringify(jwt.header, null, 2) : "";
  const payloadText = jwt ? JSON.stringify(jwt.payload, null, 2) : "";

  return (
    <ToolPage layout="scroll">
      <ToolSection
        title="Token"
        meta={
          jwt && (
            <span className="flex items-center gap-1.5">
              {String(alg ?? "unknown")}
              {expiry && <Badge variant={expiryBadge[expiry.state].variant}>{expiryBadge[expiry.state].label}</Badge>}
            </span>
          )
        }
        actions={<InputActions value={token} onChange={setToken} sample={sample} />}
        padded={false}
        className="h-32 shrink-0"
      >
        <CodeEditor value={token} onChange={setToken} lineNumbers={false} placeholder="Paste a JWT (a “Bearer” prefix is fine)" />
      </ToolSection>

      {decoded && !decoded.ok && <StatusMessage tone="error">{decoded.error}</StatusMessage>}

      {jwt && (
        <>
          <SplitView className="flex-none">
            <ToolSection title="Header" actions={<CopyButton value={headerText} />} padded={false} className="h-56">
              <CodeEditor value={headerText} language={jsonLanguage} readOnly lineNumbers={false} />
            </ToolSection>
            <ToolSection title="Payload" actions={<CopyButton value={payloadText} />} padded={false} className="h-56">
              <CodeEditor value={payloadText} language={jsonLanguage} readOnly lineNumbers={false} />
            </ToolSection>
          </SplitView>

          <ToolSection title="Claims">
            <ResultList>
              {Object.entries(jwt.payload).map(([key, value]) => (
                <ResultRow
                  key={key}
                  label={registeredClaims[key] ? `${registeredClaims[key]} (${key})` : key}
                  value={claimValue(key, value)}
                />
              ))}
            </ResultList>
          </ToolSection>

          <ToolSection title="Signature" meta={canVerify(alg) ? "HMAC secret stays on this Mac" : `Verification supports HS256, HS384 and HS512`}>
            {canVerify(alg) ? (
              <div className="flex items-center gap-3">
                <Input
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Secret"
                  spellCheck={false}
                  className="max-w-md font-mono text-[13px]"
                />
                {verification.status === "success" &&
                  (verification.value ? (
                    <Badge variant="secondary" className="text-success">Signature verified</Badge>
                  ) : (
                    <Badge variant="destructive">Invalid signature</Badge>
                  ))}
              </div>
            ) : (
              <p className="font-mono text-[12.5px] break-all text-muted-foreground select-text">{jwt.signature}</p>
            )}
          </ToolSection>
        </>
      )}
    </ToolPage>
  );
}
