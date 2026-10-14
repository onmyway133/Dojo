import { CircleAlert, CircleCheck, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { IconAction, ResultList, ResultRow, ToolPage, ToolSection } from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { strengthBadgeVariant, strengthLabel } from "@/tools/shared/strength";
import { analyzePassword, crackSeconds, describeDuration } from "./logic";

// Assumed attacker speeds; real numbers depend on the hash and hardware.
const scenarios: [string, number][] = [
  ["Online, rate limited (100/s)", 100],
  ["Offline, slow hash (10 thousand/s)", 1e4],
  ["Offline, fast hash (10 billion/s)", 1e10],
];

export default function PasswordStrengthTool() {
  // Kept in memory only: a password under test shouldn't be persisted to disk.
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const report = analyzePassword(password);
  const strength = strengthLabel(report.bits);

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Password" meta="Never stored or sent anywhere">
        <div className="flex items-center gap-1">
          <Input
            type={visible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type a password to check"
            spellCheck={false}
            autoComplete="off"
            className="max-w-xl font-mono text-[14px]"
          />
          <IconAction label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((v) => !v)}>
            {visible ? <EyeOff /> : <Eye />}
          </IconAction>
        </div>
      </ToolSection>
      {password && (
        <>
          <ToolSection
            title="Strength"
            meta={<Badge variant={strengthBadgeVariant(strength.tone)}>{strength.label}</Badge>}
          >
            <ResultList>
              <ResultRow label="Entropy" value={`${Math.round(report.bits)} bits`} />
              <ResultRow label="Length" value={`${report.length} characters`} />
              <ResultRow label="Character pool" value={`${report.pool} (${report.classes.join(", ")})`} />
            </ResultList>
          </ToolSection>
          <ToolSection title="Time to Guess" meta="Estimates, average case">
            <ResultList>
              {scenarios.map(([label, rate]) => (
                <ResultRow key={label} label={label} value={describeDuration(crackSeconds(report.bits, rate))} className="[&>div:first-child]:w-60" />
              ))}
            </ResultList>
          </ToolSection>
          <ToolSection title="Notes">
            <ul className="flex flex-col gap-2 text-[13px]">
              {report.warnings.length === 0 ? (
                <li className="flex items-center gap-2">
                  <CircleCheck className="size-4 text-success" /> No common patterns found
                </li>
              ) : (
                report.warnings.map((w) => (
                  <li key={w} className="flex items-center gap-2">
                    <CircleAlert className="size-4 text-warning" /> {w}
                  </li>
                ))
              )}
            </ul>
          </ToolSection>
        </>
      )}
    </ToolPage>
  );
}
