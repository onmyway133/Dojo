import { UAParser } from "ua-parser-js";
import { useMemo } from "react";
import {
  Chip,
  CodeEditor,
  InputActions,
  ResultList,
  ResultRow,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";

const samples = [
  { label: "This app", ua: navigator.userAgent },
  { label: "Safari macOS", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15" },
  { label: "iPhone", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" },
  { label: "Chrome Windows", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36" },
  { label: "Android", ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36" },
];

const join = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" ");

export default function UserAgentTool() {
  const [ua, setUa] = usePersistentState("ua", navigator.userAgent);
  const result = useMemo(() => new UAParser(ua.trim()).getResult(), [ua]);

  return (
    <ToolPage layout="scroll">
      <ToolSection title="User Agent" actions={<InputActions value={ua} onChange={setUa} />} padded={false} className="h-36 shrink-0">
        <CodeEditor value={ua} onChange={setUa} lineNumbers={false} placeholder="Paste a User-Agent header" />
      </ToolSection>
      <div className="flex shrink-0 flex-wrap gap-1.5">
        {samples.map((s) => (
          <Chip key={s.label} selected={s.ua === ua} onClick={() => setUa(s.ua)}>
            {s.label}
          </Chip>
        ))}
      </div>
      <ToolSection title="Parsed">
        <ResultList>
          <ResultRow label="Browser" value={join(result.browser.name, result.browser.version)} />
          <ResultRow label="Engine" value={join(result.engine.name, result.engine.version)} />
          <ResultRow label="OS" value={join(result.os.name, result.os.version)} />
          <ResultRow label="Device" value={join(result.device.vendor, result.device.model, result.device.type && `(${result.device.type})`)} />
          <ResultRow label="CPU" value={result.cpu.architecture ?? ""} />
        </ResultList>
      </ToolSection>
    </ToolPage>
  );
}
