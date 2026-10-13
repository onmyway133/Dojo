import { formatDistanceStrict } from "date-fns";
import { useMemo } from "react";
import {
  Chip,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Input } from "@/components/ui/input";
import { cronPresets, describeCron } from "./logic";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" });

export default function CronParserTool() {
  const [expression, setExpression] = usePersistentState("expression", "*/15 9-17 * * 1-5");

  const result = useMemo(() => {
    try {
      return { ok: true as const, info: describeCron(expression, 10) };
    } catch (error) {
      return { ok: false as const, error: error instanceof Error ? error.message : String(error) };
    }
  }, [expression]);

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Expression" meta="minute hour day month weekday, optional seconds first">
        <Input
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          spellCheck={false}
          className="h-10 font-mono text-[15px]"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {cronPresets.map((preset) => (
            <Chip key={preset.expression} selected={preset.expression === expression.trim()} onClick={() => setExpression(preset.expression)}>
              {preset.label}
            </Chip>
          ))}
        </div>
      </ToolSection>

      {!result.ok && <StatusMessage tone="error">{result.error}</StatusMessage>}

      {result.ok && (
        <>
          <ToolSection>
            <p className="text-[17px] font-semibold">{result.info.description}</p>
            <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
              {result.info.fields.map((field) => (
                <div key={field.name} className="ds-well m-0 px-3 py-2">
                  <div className="font-mono text-[15px]">{field.value}</div>
                  <div className="text-xs text-muted-foreground">{field.name}</div>
                </div>
              ))}
            </div>
          </ToolSection>
          <ToolSection title="Next Runs" meta="Local time">
            <ol className="-mx-2 flex flex-col gap-0.5">
              {result.info.next.map((date, index) => (
                <li key={date.getTime()} className="ds-row flex items-center gap-3 rounded-lg px-2 py-1.5 text-[13px]">
                  <span className="w-5 text-right text-muted-foreground tabular-nums">{index + 1}</span>
                  <span className="flex-1">{dateFormat.format(date)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceStrict(date, new Date(), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ol>
          </ToolSection>
        </>
      )}
    </ToolPage>
  );
}
