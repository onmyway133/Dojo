import { Outlet } from "react-router";
import { CommandMenu } from "./CommandMenu";
import { Sidebar } from "./sidebar/Sidebar";

/** Sidebar on the vibrancy material, opaque content pane on the right. */
export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col bg-background">
        <Outlet />
      </main>
      <CommandMenu />
    </div>
  );
}
