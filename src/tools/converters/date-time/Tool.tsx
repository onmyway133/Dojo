import { useMemo } from "react";
import {
  Chip,
  CopyButton,
  FieldList,
  FieldRow,
  OptionSelect,
  ResultList,
  ResultRow,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Input } from "@/components/ui/input";
import { useNow } from "@/hooks/useNow";
import { describeDate, formatInZone, parseDateInput } from "./logic";

const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const zoneChoices = ["UTC", ...Intl.supportedValuesOf("timeZone").filter((z) => z !== "UTC")].map((z) => ({
  value: z,
  label: z === localZone ? `${z} (Local)` : z.replaceAll("_", " "),
}));

const patternPresets = ["yyyy-MM-dd HH:mm:ss", "dd/MM/yyyy", "MMM d, yyyy h:mm a", "EEEE", "yyyyMMdd'T'HHmmss", "QQQ yyyy"];

export default function DateTimeTool() {
  const [input, setInput] = usePersistentState("input", "");
  const [timeZone, setTimeZone] = usePersistentState("timeZone", localZone);
  const [pattern, setPattern] = usePersistentState("pattern", "yyyy-MM-dd HH:mm:ss");

  const live = input.trim() === "";
  const now = useNow(true);
  const parsed = useMemo(() => (live ? { ok: true as const, date: now, detected: "Now" } : parseDateInput(input)), [live, input, now]);
  const info = parsed.ok ? describeDate(parsed.date, timeZone, now) : undefined;

  let custom = "";
  let customError: string | undefined;
  if (parsed.ok) {
    try {
      custom = formatInZone(parsed.date, timeZone, pattern);
    } catch (error) {
      customError = (error as Error).message;
    }
  }

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Input" meta={parsed.ok ? parsed.detected : undefined}>
        <FieldList>
          <FieldRow label="Date or timestamp" hint={live ? "Showing the current time. Type a value to convert it." : undefined}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="1760000000, 2026-10-13T09:30:00Z, Oct 13 2026…"
              spellCheck={false}
              className="font-mono text-[13px]"
            />
            <Chip onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}>Now</Chip>
          </FieldRow>
          <FieldRow label="Time zone">
            <OptionSelect value={timeZone} onChange={setTimeZone} choices={zoneChoices} className="h-8 w-72" />
          </FieldRow>
        </FieldList>
      </ToolSection>

      {!parsed.ok && <StatusMessage tone="error">{parsed.error}</StatusMessage>}

      {info && (
        <ToolSection title="Formats">
          <ResultList>
            <ResultRow label="Unix seconds" value={info.unixSeconds} mono />
            <ResultRow label="Unix milliseconds" value={info.unixMillis} mono />
            <ResultRow label="ISO 8601 (UTC)" value={info.isoUtc} mono />
            <ResultRow label="ISO 8601 (zone)" value={info.isoZone} mono />
            <ResultRow label="RFC 2822" value={info.rfc2822} mono />
            <ResultRow label="Readable" value={info.readable} />
            <ResultRow label="Relative" value={info.relative} />
            <ResultRow label="Day of year" value={info.dayOfYear} />
            <ResultRow label="ISO week" value={info.isoWeek} />
          </ResultList>
        </ToolSection>
      )}

      {parsed.ok && (
        <ToolSection title="Custom Format" meta="date-fns tokens">
          <FieldList>
            <FieldRow label="Pattern">
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                spellCheck={false}
                className="font-mono text-[13px]"
              />
            </FieldRow>
            <div className="flex flex-wrap gap-1.5 pl-35">
              {patternPresets.map((preset) => (
                <Chip key={preset} selected={preset === pattern} onClick={() => setPattern(preset)}>
                  {preset}
                </Chip>
              ))}
            </div>
            <FieldRow label="Result" hint={customError} error={Boolean(customError)}>
              <div className="flex h-8 min-w-0 flex-1 items-center ds-field px-2.5 font-mono text-[13px] select-text">
                <span className="truncate">{custom}</span>
              </div>
              <CopyButton value={custom} />
            </FieldRow>
          </FieldList>
        </ToolSection>
      )}
    </ToolPage>
  );
}
