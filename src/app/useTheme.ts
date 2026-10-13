import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useSyncExternalStore } from "react";
import { styleById } from "@/design/themes";
import { inTauri } from "@/lib/platform";
import { useSettings } from "@/stores/settings";

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function subscribe(onChange: () => void) {
  darkQuery.addEventListener("change", onChange);
  return () => darkQuery.removeEventListener("change", onChange);
}

/** The theme actually shown, after resolving "system". */
export function useResolvedTheme(): "light" | "dark" {
  const preference = useSettings((s) => s.theme);
  const systemDark = useSyncExternalStore(subscribe, () => darkQuery.matches);
  if (preference === "system") return systemDark ? "dark" : "light";
  return preference;
}

/**
 * Applies the theme to the document and, in the app, to the native window so the
 * vibrancy material behind the sidebar matches the web content.
 */
export function useApplyTheme() {
  const preference = useSettings((s) => s.theme);
  const resolved = useResolvedTheme();

  const style = useSettings((s) => s.style);
  const accent = useSettings((s) => s.accent);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  useEffect(() => {
    applyStyle(style, accent);
  }, [style, accent]);

  useEffect(() => {
    if (!inTauri) return;
    getCurrentWindow()
      .setTheme(preference === "system" ? null : preference)
      .catch(() => {});
  }, [preference]);
}

/** Sets the design system attributes on <html>. Also called before the first render. */
export function applyStyle(style: string, accent: string) {
  const root = document.documentElement;
  root.dataset.style = styleById(style).id;
  root.dataset.accent = accent;
  root.dataset.scrollbars = styleById(style).scrollbars;
}
