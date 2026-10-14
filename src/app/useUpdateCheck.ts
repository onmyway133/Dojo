import { useEffect } from "react";
import { toast } from "sonner";
import { findUpdate, installUpdate } from "@/lib/updates";
import { useSettings } from "@/stores/settings";

/** Checks once shortly after launch when automatic checks are on, and offers to install. */
export function useUpdateCheck() {
  const automatic = useSettings((s) => s.checkUpdatesAutomatically);

  useEffect(() => {
    if (!automatic) return;
    const timer = setTimeout(async () => {
      try {
        const update = await findUpdate();
        if (!update) return;
        toast(`Dojo ${update.version} is available`, {
          description: "Install now and restart?",
          duration: Infinity,
          action: { label: "Install", onClick: () => void installUpdate(update) },
        });
      } catch {
        // Offline or no release feed yet; try again next launch.
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [automatic]);
}
