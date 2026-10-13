import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "system" | "light" | "dark";

interface SettingsState {
  theme: ThemePreference;
  /** Font size of code editors, in px. */
  editorFontSize: number;
  /** Soft-wrap long lines in code editors. */
  editorWrap: boolean;
  setTheme: (theme: ThemePreference) => void;
  setEditorFontSize: (size: number) => void;
  setEditorWrap: (wrap: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      editorFontSize: 13,
      editorWrap: true,
      setTheme: (theme) => set({ theme }),
      setEditorFontSize: (editorFontSize) => set({ editorFontSize }),
      setEditorWrap: (editorWrap) => set({ editorWrap }),
    }),
    { name: "settings" },
  ),
);
