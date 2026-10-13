import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { inTauri } from "./platform";

/** The newer release on GitHub, or undefined when up to date. */
export async function findUpdate(): Promise<Update | undefined> {
  if (!inTauri) return undefined;
  return (await check()) ?? undefined;
}

/** Downloads and installs, reports progress 0–1, then restarts into the new version. */
export async function installUpdate(update: Update, onProgress?: (fraction: number) => void) {
  let total = 0;
  let received = 0;
  await update.downloadAndInstall((event) => {
    if (event.event === "Started") total = event.data.contentLength ?? 0;
    if (event.event === "Progress") {
      received += event.data.chunkLength;
      if (total) onProgress?.(received / total);
    }
  });
  await relaunch();
}
