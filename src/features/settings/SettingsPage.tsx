import { getVersion } from "@tauri-apps/api/app";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import type { Update } from "@tauri-apps/plugin-updater";
import { Check, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Choice, PageHeader, Segmented, ToolSection } from "@/components/tool";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { accents } from "@/design/themes";
import { useAsync } from "@/hooks/useAsync";
import { inTauri } from "@/lib/platform";
import { findUpdate, installUpdate } from "@/lib/updates";
import { useLibrary } from "@/stores/library";
import { type ThemePreference, useSettings } from "@/stores/settings";
import { resetToolState } from "@/stores/toolState";
import { SettingList, SettingRow } from "./SettingRow";

const appearanceChoices: Choice<ThemePreference>[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];
type FontSize = "12" | "13" | "14" | "15" | "16";
const fontChoices: Choice<FontSize>[] = ["12", "13", "14", "15", "16"].map((v) => ({ value: v as FontSize, label: v }));

function LaunchAtLogin() {
  const [refresh, setRefresh] = useState(0);
  const enabled = useAsync(() => (inTauri ? isEnabled() : undefined), [refresh]);
  async function toggle(on: boolean) {
    try {
      await (on ? enable() : disable());
    } catch (error) {
      toast.error("Couldn't change the login item", { description: String(error) });
    }
    setRefresh((r) => r + 1);
  }
  return (
    <SettingRow title="Open at login" description="Start DevTools when you log in to your Mac">
      <Switch checked={enabled.status === "success" && enabled.value} disabled={!inTauri} onCheckedChange={toggle} />
    </SettingRow>
  );
}

type UpdateState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "current" }
  | { kind: "available"; update: Update }
  | { kind: "installing"; progress: number }
  | { kind: "error"; message: string };

function Updates() {
  const automatic = useSettings((s) => s.checkUpdatesAutomatically);
  const setAutomatic = useSettings((s) => s.setCheckUpdatesAutomatically);
  const version = useAsync(() => (inTauri ? getVersion() : undefined), []);
  const [state, setState] = useState<UpdateState>({ kind: "idle" });

  async function checkNow() {
    setState({ kind: "checking" });
    try {
      const update = await findUpdate();
      setState(update ? { kind: "available", update } : { kind: "current" });
    } catch (error) {
      setState({ kind: "error", message: String(error) });
    }
  }

  async function install(update: Update) {
    setState({ kind: "installing", progress: 0 });
    try {
      await installUpdate(update, (progress) => setState({ kind: "installing", progress }));
    } catch (error) {
      setState({ kind: "error", message: String(error) });
    }
  }

  const status = {
    idle: version.status === "success" ? `You have version ${version.value}` : "",
    checking: "Checking…",
    current: "DevTools is up to date",
    available: state.kind === "available" ? `Version ${state.update.version} is available` : "",
    installing: state.kind === "installing" ? `Downloading ${Math.round(state.progress * 100)}%…` : "",
    error: state.kind === "error" ? `Couldn't check: ${state.message}` : "",
  }[state.kind];

  return (
    <SettingList>
      <SettingRow title="Software update" description={status}>
        {state.kind === "available" ? (
          <Button onClick={() => install(state.update)}>Install and Restart</Button>
        ) : (
          <Button variant="secondary" onClick={checkNow} disabled={!inTauri || state.kind === "checking" || state.kind === "installing"}>
            Check Now
          </Button>
        )}
      </SettingRow>
      <SettingRow title="Check for updates automatically" description="Looks for a new release on GitHub when the app starts">
        <Switch checked={automatic} onCheckedChange={setAutomatic} />
      </SettingRow>
    </SettingList>
  );
}

export function SettingsPage() {
  const settings = useSettings();
  const clearLibrary = () => useLibrary.setState({ favorites: [], recents: [] });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader icon={Settings} title="Settings" description="Startup, appearance, editor and updates" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-4 pb-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <ToolSection title="General">
            <SettingList>
              <LaunchAtLogin />
            </SettingList>
          </ToolSection>

          <ToolSection title="Appearance">
            <SettingList>
              <SettingRow title="Appearance" description="Auto follows the system">
                <Segmented value={settings.theme} onChange={settings.setTheme} choices={appearanceChoices} />
              </SettingRow>
              <SettingRow title="Accent color">
                <div className="flex gap-2">
                  {accents.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      aria-label={a.name}
                      aria-pressed={a.id === settings.accent}
                      title={a.name}
                      onClick={() => settings.setAccent(a.id)}
                      className="flex size-6 items-center justify-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                      style={{ background: a.color }}
                    >
                      {a.id === settings.accent && <Check className="size-3.5" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </SettingRow>
            </SettingList>
          </ToolSection>

          <ToolSection title="Editor">
            <SettingList>
              <SettingRow title="Font size">
                <Segmented
                  value={String(settings.editorFontSize) as FontSize}
                  onChange={(v) => settings.setEditorFontSize(Number(v))}
                  choices={fontChoices}
                />
              </SettingRow>
              <SettingRow title="Wrap long lines">
                <Switch checked={settings.editorWrap} onCheckedChange={settings.setEditorWrap} />
              </SettingRow>
            </SettingList>
          </ToolSection>

          <ToolSection title="Updates">
            <Updates />
          </ToolSection>

          <ToolSection title="Data">
            <SettingList>
              <SettingRow title="Saved tool input" description="Every tool remembers what you typed and its options">
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetToolState();
                    toast.success("Tool input cleared");
                  }}
                >
                  Clear
                </Button>
              </SettingRow>
              <SettingRow title="Favorites and recents">
                <Button
                  variant="secondary"
                  onClick={() => {
                    clearLibrary();
                    toast.success("Favorites and recents cleared");
                  }}
                >
                  Clear
                </Button>
              </SettingRow>
            </SettingList>
          </ToolSection>
        </div>
      </div>
    </div>
  );
}
