import { decodeTime, isValid, ulid } from "ulid";
import { useMemo, useState } from "react";
import {
  type Choice,
  Option,
  OptionSwitch,
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
import { GeneratedList } from "@/tools/shared/GeneratedList";

type Count = "1" | "5" | "10" | "50";
const countChoices: Choice<Count>[] = ["1", "5", "10", "50"].map((v) => ({ value: v as Count, label: v }));
const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" });

export default function UlidTool() {
  const [count, setCount] = usePersistentState<Count>("count", "5");
  const [lowercase, setLowercase] = usePersistentState("lowercase", false);
  const [seed, setSeed] = useState(0);
  const [inspect, setInspect] = usePersistentState("inspect", "");

  const ids = useMemo(
    () => Array.from({ length: Number(count) }, () => (lowercase ? ulid().toLowerCase() : ulid())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, lowercase, seed],
  );
  const trimmed = inspect.trim().toUpperCase();
  const valid = trimmed !== "" && isValid(trimmed);

  return (
    <ToolPage>
      <ToolOptions>
        <Option label="Count">
          <Segmented value={count} onChange={setCount} choices={countChoices} />
        </Option>
        <OptionSwitch label="Lowercase" checked={lowercase} onChange={setLowercase} />
      </ToolOptions>
      <GeneratedList title="ULIDs" meta="Sort by creation time" values={ids} onRegenerate={() => setSeed((s) => s + 1)} />
      <ToolSection title="Inspect" className="shrink-0">
        <Input
          value={inspect}
          onChange={(e) => setInspect(e.target.value)}
          placeholder="Paste a ULID to read its timestamp"
          spellCheck={false}
          className="font-mono text-[13px]"
        />
        {trimmed && !valid && <StatusMessage tone="error" className="mt-3">Not a valid ULID</StatusMessage>}
        {valid && (
          <div className="mt-2">
            <ResultList>
              <ResultRow label="Created" value={dateTime.format(decodeTime(trimmed))} />
              <ResultRow label="Unix ms" value={String(decodeTime(trimmed))} mono />
            </ResultList>
          </div>
        )}
      </ToolSection>
    </ToolPage>
  );
}
