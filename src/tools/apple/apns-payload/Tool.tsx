import { json } from "@codemirror/lang-json";
import { useMemo } from "react";
import {
  type Choice,
  CodeEditor,
  CopyButton,
  FieldList,
  FieldRow,
  OptionSelect,
  Segmented,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useDebounced } from "@/hooks/useDebounced";
import {
  type CurlOptions,
  type InterruptionLevel,
  type PayloadForm,
  type PushType,
  buildPayload,
  curlCommand,
  emptyForm,
  lintPayload,
  payloadSize,
  sizeLimit,
} from "./logic";

const jsonLanguage = json();

const pushTypes: Choice<PushType>[] = [
  { value: "alert", label: "Alert" },
  { value: "background", label: "Background" },
  { value: "voip", label: "VoIP" },
];
const levels: Choice<InterruptionLevel>[] = [
  { value: "default", label: "Default" },
  { value: "passive", label: "Passive" },
  { value: "active", label: "Active" },
  { value: "time-sensitive", label: "Time Sensitive" },
  { value: "critical", label: "Critical" },
];

function build(form: PayloadForm) {
  try {
    return { payload: buildPayload(form) };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export default function ApnsPayloadTool() {
  const [form, setForm] = usePersistentState<PayloadForm>("form", emptyForm);
  const [curl, setCurl] = usePersistentState<CurlOptions>("curl", { topic: "", token: "", sandbox: true });
  const set = (patch: Partial<PayloadForm>) => setForm((f) => ({ ...f, ...patch }));
  const setCurlOption = (patch: Partial<CurlOptions>) => setCurl((c) => ({ ...c, ...patch }));

  const debounced = useDebounced(form, 120);
  const { payload, error } = useMemo(() => build(debounced), [debounced]);
  const output = payload ? JSON.stringify(payload, null, 2) : "";
  const size = payload ? payloadSize(payload) : 0;
  const limit = sizeLimit(debounced.pushType);
  const lints = payload ? lintPayload(payload, debounced.pushType) : [];
  const text = (key: keyof PayloadForm, placeholder?: string) => (
    <Input
      value={form[key] as string}
      onChange={(e) => set({ [key]: e.target.value })}
      placeholder={placeholder}
      spellCheck={false}
      className="max-w-96"
    />
  );

  return (
    <ToolPage layout="scroll">
      <div className="grid gap-4 lg:grid-cols-2">
        <ToolSection title="Notification">
          <FieldList>
            <FieldRow label="Push type">
              <Segmented value={form.pushType} onChange={(pushType) => set({ pushType })} choices={pushTypes} />
            </FieldRow>
            <FieldRow label="Title">{text("title")}</FieldRow>
            <FieldRow label="Subtitle">{text("subtitle")}</FieldRow>
            <FieldRow label="Body">{text("body")}</FieldRow>
            <FieldRow label="Badge">{text("badge", "Number, 0 clears")}</FieldRow>
            <FieldRow label="Sound">{text("sound", "default or a file name")}</FieldRow>
            <FieldRow label="Thread ID">{text("threadId", "Groups notifications")}</FieldRow>
            <FieldRow label="Category">{text("category", "Actions category identifier")}</FieldRow>
            <FieldRow label="Interruption">
              <OptionSelect value={form.interruptionLevel} onChange={(interruptionLevel) => set({ interruptionLevel })} choices={levels} />
            </FieldRow>
            <FieldRow label="Relevance">{text("relevanceScore", "0 to 1")}</FieldRow>
            <FieldRow label="Content available">
              <Switch checked={form.contentAvailable} onCheckedChange={(contentAvailable) => set({ contentAvailable })} className="mt-1.5" />
            </FieldRow>
            <FieldRow label="Mutable content">
              <Switch checked={form.mutableContent} onCheckedChange={(mutableContent) => set({ mutableContent })} className="mt-1.5" />
            </FieldRow>
          </FieldList>
        </ToolSection>
        <div className="flex flex-col gap-4">
          <ToolSection
            title="Payload"
            meta={
              payload && (
                <Badge variant={size > limit ? "destructive" : "secondary"}>
                  {size} / {limit} bytes
                </Badge>
              )
            }
            actions={<CopyButton value={payload ? JSON.stringify(payload) : ""} label="Copy Minified" />}
            padded={false}
            className="shrink-0"
          >
            {error ? <StatusMessage tone="error" className="mx-4">{error}</StatusMessage> : <CodeEditor value={output} language={jsonLanguage} readOnly lineNumbers={false} />}
          </ToolSection>
          {payload && (
            <div className="flex flex-col gap-2">
              {lints.length === 0 && <StatusMessage tone="success">Within the limit, no problems found</StatusMessage>}
              {lints.map((lint) => (
                <StatusMessage key={lint.message} tone={lint.level === "error" ? "error" : "info"}>
                  {lint.message}
                </StatusMessage>
              ))}
            </div>
          )}
          <ToolSection title="Custom data" meta="JSON next to aps" padded={false} className="h-40 shrink-0" fill>
            <CodeEditor value={form.custom} onChange={(custom) => set({ custom })} language={jsonLanguage} lineNumbers={false} />
          </ToolSection>
        </div>
      </div>
      <ToolSection title="Send with curl" actions={payload && <CopyButton value={curlCommand(payload, debounced.pushType, curl)} />}>
        <FieldList>
          <FieldRow label="Bundle ID">
            <Input value={curl.topic} onChange={(e) => setCurlOption({ topic: e.target.value })} placeholder="com.example.app" spellCheck={false} className="max-w-96" />
          </FieldRow>
          <FieldRow label="Device token">
            <Input value={curl.token} onChange={(e) => setCurlOption({ token: e.target.value })} placeholder="Hex token from the device" spellCheck={false} className="max-w-96 font-mono text-[13px]" />
          </FieldRow>
          <FieldRow label="Sandbox" hint="Development builds use the sandbox; set AUTHENTICATION_TOKEN to a JWT signed with your .p8 key">
            <Switch checked={curl.sandbox} onCheckedChange={(sandbox) => setCurlOption({ sandbox })} className="mt-1.5" />
          </FieldRow>
        </FieldList>
        {payload && (
          <pre className="ds-well mt-3 overflow-x-auto rounded-lg px-3 py-2 font-mono text-[12px] whitespace-pre select-text">
            {curlCommand(payload, debounced.pushType, curl)}
          </pre>
        )}
      </ToolSection>
    </ToolPage>
  );
}
