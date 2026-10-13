import * as plugin from "@tauri-apps/plugin-clipboard-manager";
import { inTauri } from "./platform";

// The native plugin avoids WebKit's paste permission callout inside the app window.
export const copyText = (text: string) =>
  inTauri ? plugin.writeText(text) : navigator.clipboard.writeText(text);

export const readText = () => (inTauri ? plugin.readText() : navigator.clipboard.readText());
