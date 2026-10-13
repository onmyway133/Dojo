import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import { inTauri } from "@/lib/platform";
import "./index.css";

document.documentElement.classList.toggle("tauri", inTauri);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
