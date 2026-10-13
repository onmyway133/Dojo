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
import { Input } from "@/components/ui/input";
import { bump, bumps, checkRange, compareVersions, parseVersion } from "./logic";

const mono = "font-mono text-[13px]";

export default function SemverTool() {
  const [version, setVersion] = usePersistentState("version", "1.4.2-beta.1");
  const [preid, setPreid] = usePersistentState("preid", "beta");
  const [other, setOther] = usePersistentState("other", "1.10.0");
  const [range, setRange] = usePersistentState("range", "^1.2.0 || ~2.0");

  const info = parseVersion(version);
  const comparison = compareVersions(version, other);
  const rangeCheck = checkRange(version, range);

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Version">
        <FieldList>
          <FieldRow label="Version" hint={version.trim() && !info ? "Not a valid semantic version" : undefined} error={Boolean(version.trim() && !info)}>
            <Input value={version} onChange={(e) => setVersion(e.target.value)} spellCheck={false} className={mono} />
          </FieldRow>
        </FieldList>
        {info && (
          <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2">
            {[
              ["Major", info.major],
              ["Minor", info.minor],
              ["Patch", info.patch],
              ["Pre-release", info.prerelease || "—"],
              ["Build", info.build || "—"],
            ].map(([label, value]) => (
              <div key={label} className="ds-well m-0 px-3 py-2">
                <div className="font-mono text-[15px]">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        )}
      </ToolSection>

      {info && (
        <ToolSection title="Bump" meta="Next version for each release type">
          <FieldList>
            <FieldRow label="Pre-release id">
              <Input value={preid} onChange={(e) => setPreid(e.target.value)} placeholder="beta, rc, alpha" className={`${mono} max-w-48`} />
            </FieldRow>
          </FieldList>
          <div className="mt-2">
            <ResultList>
              {bumps.map((kind) => (
                <ResultRow key={kind} label={kind} value={bump(info.version, kind, preid)} mono />
              ))}
            </ResultList>
          </div>
        </ToolSection>
      )}

      <ToolSection title="Compare">
        <FieldList>
          <FieldRow label="Other version">
            <Input value={other} onChange={(e) => setOther(e.target.value)} spellCheck={false} className={mono} />
            {comparison && (
              <Badge variant="secondary" className="font-mono">
                {version.trim()} {comparison} {other.trim()}
              </Badge>
            )}
          </FieldRow>
        </FieldList>
      </ToolSection>

      <ToolSection title="Range">
        <FieldList>
          <FieldRow label="Range" hint={rangeCheck.normalized ? `Means ${rangeCheck.normalized}` : undefined}>
            <Input value={range} onChange={(e) => setRange(e.target.value)} spellCheck={false} className={mono} />
            {rangeCheck.satisfies !== undefined && (
              <Badge variant={rangeCheck.satisfies ? "default" : "destructive"}>{rangeCheck.satisfies ? "Satisfies" : "Outside range"}</Badge>
            )}
          </FieldRow>
        </FieldList>
        {range.trim() && !rangeCheck.valid && <StatusMessage tone="error" className="mt-3">Not a valid range</StatusMessage>}
      </ToolSection>
    </ToolPage>
  );
}
