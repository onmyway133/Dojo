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
import { generateUuids, inspectUuid, type UuidVersion } from "./logic";

const versionChoices: Choice<UuidVersion>[] = [
  { value: "v4", label: "v4 random" },
  { value: "v7", label: "v7 time-ordered" },
];
const countChoices: Choice<"1" | "5" | "10" | "50">[] = ["1", "5", "10", "50"].map((v) => ({ value: v as "1", label: v }));

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" });

export default function UuidTool() {
  const [kind, setKind] = usePersistentState<UuidVersion>("version", "v4");
  const [count, setCount] = usePersistentState<"1" | "5" | "10" | "50">("count", "5");
  const [uppercase, setUppercase] = usePersistentState("uppercase", false);
  const [hyphens, setHyphens] = usePersistentState("hyphens", true);
  const [seed, setSeed] = useState(0);
  const [inspect, setInspect] = usePersistentState("inspect", "");

  // `seed` forces a fresh batch on Regenerate.
  const ids = useMemo(
    () => generateUuids(kind, Number(count), { uppercase, hyphens }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind, count, uppercase, hyphens, seed],
  );
  const info = inspect.trim() ? inspectUuid(inspect) : undefined;

  return (
    <ToolPage>
      <ToolOptions>
        <Option label="Version">
          <Segmented value={kind} onChange={setKind} choices={versionChoices} />
        </Option>
        <Option label="Count">
          <Segmented value={count} onChange={setCount} choices={countChoices} />
        </Option>
        <OptionSwitch label="Uppercase" checked={uppercase} onChange={setUppercase} />
        <OptionSwitch label="Hyphens" checked={hyphens} onChange={setHyphens} />
      </ToolOptions>
      <GeneratedList title="UUIDs" values={ids} onRegenerate={() => setSeed((s) => s + 1)} />
      <ToolSection title="Inspect" className="shrink-0">
        <Input
          value={inspect}
          onChange={(e) => setInspect(e.target.value)}
          placeholder="Paste a UUID to see its version and time"
          spellCheck={false}
          className="font-mono text-[13px]"
        />
        {inspect.trim() && !info && <StatusMessage tone="error" className="mt-3">Not a valid UUID</StatusMessage>}
        {info && (
          <div className="mt-2">
            <ResultList>
              <ResultRow label="Version" value={`v${info.version}`} />
              <ResultRow label="Variant" value={info.variant} />
              {info.timestamp && <ResultRow label="Created" value={dateTime.format(info.timestamp)} />}
            </ResultList>
          </div>
        )}
      </ToolSection>
    </ToolPage>
  );
}
