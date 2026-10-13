import { listen } from "@tauri-apps/api/event";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useEffect, useEffectEvent } from "react";
import { Outlet, useNavigate } from "react-router";
import { useHotkey } from "@/hooks/useHotkey";
import { inTauri } from "@/lib/platform";
import { useCommandMenu } from "@/stores/commandMenu";
import { CommandMenu } from "./CommandMenu";
import { Sidebar } from "./sidebar/Sidebar";

/** Sidebar on the left, content pane on the right; both skinned by the active style. */
export function AppLayout() {
  const navigate = useNavigate();
  useHotkey({ key: ",", meta: true }, () => navigate("/settings"), !inTauri);

  // Items from the native menu bar (src-tauri/src/menu.rs).
  const onMenu = useEffectEvent((id: string) => {
    switch (id) {
      case "settings":
        return navigate("/settings");
      case "home":
        return navigate("/");
      case "open-tool":
        return useCommandMenu.getState().setOpen(true);
      case "find":
        return useCommandMenu.getState().requestSearchFocus();
      case "github":
        return void openUrl("https://github.com/onmyway133/DevTools");
    }
  });
  useEffect(() => {
    if (!inTauri) return;
    const unlisten = listen<string>("menu", (event) => onMenu(event.payload));
    return () => {
      void unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="ds-window flex min-w-0 flex-1 flex-col">
        <Outlet />
      </main>
      <CommandMenu />
    </div>
  );
}
