import { useEffect, useState } from "react";

/** Ticks once a second while `enabled`, for live clocks and countdowns. */
export function useNow(enabled = true): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [enabled]);
  return now;
}
