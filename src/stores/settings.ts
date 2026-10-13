import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type AccentId, defaultAccent, defaultStyle, type StyleId } from "@/design/themes";

export type ThemePreference = "system" | "light" | "dark";

interface SettingsState {
  /** Light, dark or follow the system. */
  theme: ThemePreference;
  /** Visual style (design system theme), see src/design/themes.ts. */
  style: StyleId;
  accent: AccentId;
  /** Font size of code editors, in px. */
  editorFontSize: number;
  /** Soft-wrap long lines in code editors. */
  editorWrap: boolean;
  setTheme: (theme: ThemePreference) => void;
  setStyle: (style: StyleId) => void;
  setAccent: (accent: AccentId) => void;
  setEditorFontSize: (size: number) => void;
  setEditorWrap: (wrap: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      style: defaultStyle,
      accent: defaultAccent,
      editorFontSize: 13,
      editorWrap: true,
      setTheme: (theme) => set({ theme }),
      setStyle: (style) => set({ style }),
      setAccent: (accent) => set({ accent }),
      setEditorFontSize: (editorFontSize) => set({ editorFontSize }),
      setEditorWrap: (editorWrap) => set({ editorWrap }),
    }),
    {
      name: "settings",
      version: 2,
      // v1 made macOS the default style, v2 removed the others; move earlier installs onto it.
      migrate: (persisted, version) => {
        const state = persisted as SettingsState;
        return version < 2 ? { ...state, style: defaultStyle } : state;
      },
    },
  ),
);
