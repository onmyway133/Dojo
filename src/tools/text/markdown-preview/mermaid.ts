type Theme = "light" | "dark";

let loaded: Promise<typeof import("mermaid").default> | undefined;
let configuredTheme: Theme | undefined;
let nextId = 0;

/** Loads mermaid on first use so it stays out of the main bundle. */
async function load(theme: Theme) {
  loaded ??= import("mermaid").then((m) => m.default);
  const mermaid = await loaded;
  if (configuredTheme !== theme) {
    // strict: labels are sanitized and click handlers are disabled.
    mermaid.initialize({ startOnLoad: false, securityLevel: "strict", suppressErrorRendering: true, theme: theme === "dark" ? "dark" : "default" });
    configuredTheme = theme;
  }
  return mermaid;
}

/** Renders one diagram to an SVG string. Throws with mermaid's message on a syntax error. */
export async function renderMermaid(source: string, theme: Theme): Promise<string> {
  const mermaid = await load(theme);
  const { svg } = await mermaid.render(`mermaid-${nextId++}`, source);
  return svg;
}
