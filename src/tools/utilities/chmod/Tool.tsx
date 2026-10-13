import { useState } from "react";
import {
  Chip,
  FieldList,
  FieldRow,
  ResultList,
  ResultRow,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { type Bit, bits, type Permissions, parsePermissions, toOctal, toSymbolic, type Who, whos } from "./logic";

const presets = ["755", "644", "600", "700", "775", "664", "444", "777"];
const titles: Record<Who, string> = { owner: "Owner", group: "Group", others: "Others" };
const bitTitles: Record<Bit, string> = { read: "Read", write: "Write", execute: "Execute" };

export default function ChmodTool() {
  const [permissions, setPermissions] = usePersistentState<Permissions>("permissions", parsePermissions("755")!);
  const [draft, setDraft] = useState<string>();
  const octal = toOctal(permissions);
  const symbolic = toSymbolic(permissions);

  const toggle = (who: Who, bit: Bit, value: boolean) =>
    setPermissions((p) => ({ ...p, [who]: { ...p[who], [bit]: value } }));

  function typeIn(text: string) {
    setDraft(text);
    const parsed = parsePermissions(text);
    if (parsed) setPermissions(parsed);
  }

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Permissions">
        <div className="grid max-w-xl items-center gap-y-2 text-[13px]" style={{ gridTemplateColumns: "100px repeat(3, minmax(0, 1fr))" }}>
          <span />
          {bits.map((b) => (
            <span key={b} className="text-center text-xs font-medium text-muted-foreground">{bitTitles[b]}</span>
          ))}
          {whos.map((w) => (
            <div key={w} className="contents">
              <span className="font-medium">{titles[w]}</span>
              {bits.map((b) => (
                <div key={b} className="flex justify-center">
                  <Checkbox
                    checked={permissions[w][b]}
                    onCheckedChange={(v) => toggle(w, b, v === true)}
                    aria-label={`${titles[w]} ${bitTitles[b]}`}
                    className="size-5"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <Chip key={p} selected={p === octal} onClick={() => typeIn(p)} className="font-mono">
              {p}
            </Chip>
          ))}
        </div>
      </ToolSection>
      <ToolSection title="Notation">
        <FieldList>
          <FieldRow label="Edit" hint={draft !== undefined && !parsePermissions(draft) ? "Use 3 octal digits or 9 rwx characters" : undefined} error>
            <Input
              value={draft ?? octal}
              onChange={(e) => typeIn(e.target.value)}
              onBlur={() => setDraft(undefined)}
              placeholder="755 or rwxr-xr-x"
              spellCheck={false}
              className="max-w-56 font-mono text-[14px]"
            />
          </FieldRow>
        </FieldList>
        <div className="mt-2">
          <ResultList>
            <ResultRow label="Octal" value={octal} mono />
            <ResultRow label="Symbolic" value={symbolic} mono />
            <ResultRow label="Command" value={`chmod ${octal} file`} mono />
            <ResultRow label="ls -l" value={`-${symbolic}`} mono />
          </ResultList>
        </div>
      </ToolSection>
    </ToolPage>
  );
}
