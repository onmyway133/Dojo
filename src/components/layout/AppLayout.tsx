import { Outlet, useNavigate } from "react-router";
import { useHotkey } from "@/hooks/useHotkey";
import { CommandMenu } from "./CommandMenu";
import { Sidebar } from "./sidebar/Sidebar";

/** Sidebar on the left, content pane on the right; both skinned by the active style. */
export function AppLayout() {
  const navigate = useNavigate();
  useHotkey({ key: ",", meta: true }, () => navigate("/settings"));

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
