import { isTauri } from "@tauri-apps/api/core";

/** True inside the desktop app, false when the frontend runs in a plain browser (vite dev). */
export const inTauri = isTauri();
