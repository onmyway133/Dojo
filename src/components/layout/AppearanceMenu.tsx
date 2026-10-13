import { Check, Palette } from "lucide-react";
import { Popover } from "radix-ui";
import { type Choice, Segmented } from "@/components/tool/options";
import { Button } from "@/components/ui/button";
import { accents, type StyleId, styles } from "@/design/themes";
import { type ThemePreference, useSettings } from "@/stores/settings";

const styleChoices: Choice<StyleId>[] = styles.map((s) => ({ value: s.id, label: s.name }));
const appearanceChoices: Choice<ThemePreference>[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="ds-panel-title text-[11px] font-semibold text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

/** Style, light/dark and accent, from the sidebar footer. */
export function AppearanceMenu() {
  const { style, theme, accent, setStyle, setTheme, setAccent } = useSettings();
  const current = styles.find((s) => s.id === style);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Palette /> Appearance
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={6}
          className="ds-menu z-50 flex w-72 flex-col gap-3.5 rounded-xl p-3.5 text-[13px] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0"
        >
          <Row label="Style">
            <Segmented value={style} onChange={setStyle} choices={styleChoices} />
            {current && <p className="text-xs text-muted-foreground">{current.description}</p>}
          </Row>
          <Row label="Appearance">
            <Segmented value={theme} onChange={setTheme} choices={appearanceChoices} />
          </Row>
          <Row label="Accent">
            <div className="flex gap-2">
              {accents.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-label={a.name}
                  aria-pressed={a.id === accent}
                  title={a.name}
                  onClick={() => setAccent(a.id)}
                  className="flex size-6 items-center justify-center rounded-full text-white shadow-[inset_0_1px_1px_rgb(255_255_255/0.5),0_1px_2px_rgb(0_0_0/0.3)] outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  style={{ background: a.color }}
                >
                  {a.id === accent && <Check className="size-3.5" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </Row>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
