import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tool";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { type CheatTarget, cheatsheet, filterCheatsheet } from "./syntax";

const hint: Record<CheatTarget, string> = {
  pattern: "Click to insert into the pattern",
  flags: "Click to turn the flag on or off",
  replacement: "Click to insert into the replacement",
};

/** Regex syntax reference, opened from the Pattern panel. Clicking a token uses it. */
export function Cheatsheet({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (target: CheatTarget, token: string) => void;
}) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => filterCheatsheet(cheatsheet, query), [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col gap-3 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Regex Cheatsheet</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">JavaScript regular expression syntax.</DialogDescription>
        </DialogHeader>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter, e.g. lookahead or digit" className="h-8 shrink-0 text-[13px]" autoFocus />
        <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4">
          {groups.map((group) => (
            <section key={group.name} className="mb-3">
              <h3 className="mb-1 text-xs font-semibold text-muted-foreground">{group.name}</h3>
              <ul className="-mx-2 flex flex-col gap-0.5">
                {group.tokens.map((t) => (
                  <li key={t.token} className="ds-row group flex items-center gap-3 rounded-lg px-2 py-1">
                    <button
                      type="button"
                      onClick={() => onPick(group.target, t.token)}
                      title={hint[group.target]}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:underline"
                    >
                      <code className="ds-badge w-28 shrink-0 truncate rounded-md px-2 py-0.5 font-mono text-[12.5px]">{t.token}</code>
                      <span className="min-w-0 flex-1 text-[13px]">{t.description}</span>
                    </button>
                    <span className="opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                      <CopyButton value={t.token} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {groups.length === 0 && <p className="py-6 text-center text-[13px] text-muted-foreground">Nothing matches.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
