import { formatDistanceStrict } from "date-fns";
import { useDeferredValue, useMemo } from "react";
import {
  CodeEditor,
  CopyButton,
  InputActions,
  OptionSwitch,
  StatusMessage,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { decodeValue, expiryOf, type ParsedCookie, parseCookies } from "./logic";

const sample = `Set-Cookie: session_id=38afes7a8; Domain=example.com; Path=/; Expires=Wed, 21 Oct 2026 07:28:00 GMT; Secure; HttpOnly; SameSite=Lax
Set-Cookie: theme=dark; Path=/; Max-Age=31536000
Set-Cookie: cart=%7B%22items%22%3A3%7D; Path=/shop; SameSite=Strict`;

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

function CookieRow({ cookie, decode }: { cookie: ParsedCookie; decode: boolean }) {
  const value = decode ? decodeValue(cookie.value) : cookie.value;
  const expiry = expiryOf(cookie);
  const expired = expiry !== "session" && expiry.getTime() <= Date.now();
  const flags = [
    cookie.secure && "Secure",
    cookie.httpOnly && "HttpOnly",
    cookie.sameSite && `SameSite=${cookie.sameSite}`,
    cookie.partitioned && "Partitioned",
    cookie.priority && `Priority=${cookie.priority}`,
  ].filter(Boolean) as string[];
  const scope = [cookie.domain && `Domain ${cookie.domain}`, cookie.path && `Path ${cookie.path}`].filter(Boolean).join(" · ");

  return (
    <div className="ds-row group rounded-lg px-2 py-2">
      <div className="flex items-start gap-3">
        <div className="w-40 shrink-0 truncate pt-0.5 font-mono text-[13px] font-semibold">{cookie.name}</div>
        <div className="min-w-0 flex-1 pt-0.5 font-mono text-[12.5px] select-text [overflow-wrap:anywhere]">
          {value || <span className="text-muted-foreground">empty</span>}
        </div>
        <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100">
          <CopyButton value={value} label="Copy Value" />
        </div>
      </div>
      {(flags.length > 0 || scope || expiry !== "session" || cookie.expires || cookie.maxAge !== undefined) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-43 text-xs text-muted-foreground">
          {flags.map((flag) => (
            <Badge key={flag} variant="secondary">{flag}</Badge>
          ))}
          {scope && <span>{scope}</span>}
          {expiry !== "session" && (
            <span className={expired ? "text-destructive" : undefined}>
              {expired ? "Expired " : "Expires "}
              {dateTime.format(expiry)} ({formatDistanceStrict(expiry, Date.now(), { addSuffix: true })})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function CookieParserTool() {
  const [input, setInput] = usePersistentState("input", "");
  const [decode, setDecode] = usePersistentState("decode", true);
  const deferred = useDeferredValue(input);

  const result = useMemo(() => {
    if (!deferred.trim()) return undefined;
    try {
      return { ok: true as const, ...parseCookies(deferred) };
    } catch (error) {
      return { ok: false as const, error: (error as Error).message };
    }
  }, [deferred]);

  const asJson = () =>
    result?.ok
      ? JSON.stringify(result.cookies.map((c) => ({ ...c, value: decode ? decodeValue(c.value) : c.value })), null, 2)
      : "";

  return (
    <ToolPage>
      <ToolOptions>
        <OptionSwitch label="URL-decode values" checked={decode} onChange={setDecode} />
      </ToolOptions>
      <ToolSection
        title="Headers"
        meta="A Cookie header, or Set-Cookie lines"
        actions={<InputActions value={input} onChange={setInput} sample={sample} />}
        padded={false}
        className="h-44 shrink-0"
      >
        <CodeEditor value={input} onChange={setInput} lineNumbers={false} placeholder="session=abc; theme=dark" />
      </ToolSection>
      {result && !result.ok && <StatusMessage tone="error">{result.error}</StatusMessage>}
      {result?.ok && (
        <ToolSection
          title="Cookies"
          meta={`${result.cookies.length} from ${result.source === "set-cookie" ? "Set-Cookie" : "a Cookie header"}`}
          actions={<CopyButton label="Copy as JSON" value={asJson} />}
          fill
          className="overflow-y-auto"
        >
          <div className="-mx-2 flex flex-col gap-0.5">
            {result.cookies.map((cookie, index) => (
              <CookieRow key={`${cookie.name}-${index}`} cookie={cookie} decode={decode} />
            ))}
          </div>
        </ToolSection>
      )}
    </ToolPage>
  );
}
