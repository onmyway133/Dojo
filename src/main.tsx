import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import { applyStyle } from "@/app/useTheme";
import { useSettings } from "@/stores/settings";
import { inTauri } from "@/lib/platform";
import "./index.css";

document.documentElement.classList.toggle("tauri", inTauri);
// Apply the saved style before React renders to avoid a flash of the default look.
const { style, accent, theme } = useSettings.getState();
applyStyle(style, accent);
document.documentElement.classList.toggle(
  "dark",
  theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches),
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
