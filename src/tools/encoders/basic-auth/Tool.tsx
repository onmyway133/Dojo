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
import { Input } from "@/components/ui/input";
import { basicAuthHeader, parseBasicAuth } from "./logic";

function decode(header: string) {
  try {
    return { value: parseBasicAuth(header) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export default function BasicAuthTool() {
  const [username, setUsername] = usePersistentState("username", "");
  const [password, setPassword] = usePersistentState("password", "");
  const [header, setHeader] = usePersistentState("header", "");
  const value = basicAuthHeader(username, password);
  const decoded = header.trim() ? decode(header) : undefined;

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Credentials">
        <FieldList>
          <FieldRow label="Username">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} spellCheck={false} autoComplete="off" className="max-w-80" />
          </FieldRow>
          <FieldRow label="Password">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} spellCheck={false} autoComplete="off" className="max-w-80" />
          </FieldRow>
        </FieldList>
      </ToolSection>
      <ToolSection title="Header">
        <ResultList>
          <ResultRow label="Value" value={value} mono />
          <ResultRow label="Header" value={`Authorization: ${value}`} mono />
          <ResultRow label="curl" value={`curl -H "Authorization: ${value}" https://example.com`} mono />
        </ResultList>
      </ToolSection>
      <ToolSection title="Decode">
        <Input
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          placeholder="Paste Authorization: Basic …"
          spellCheck={false}
          className="font-mono text-[13px]"
        />
        {decoded?.error && <StatusMessage tone="error" className="mt-3">{decoded.error}</StatusMessage>}
        {decoded?.value && (
          <div className="mt-2">
            <ResultList>
              <ResultRow label="Username" value={decoded.value.username} mono />
              <ResultRow label="Password" value={decoded.value.password} mono />
            </ResultList>
          </div>
        )}
      </ToolSection>
    </ToolPage>
  );
}
