/**
 * Registry of visual styles and accents. A style is a CSS file in src/styles/themes/
 * that sets every `--ds-*` variable for light and dark under `[data-style="<id>"]`.
 * Adding a style: create the CSS file, import it in src/index.css, add an entry here.
 * The Appearance menu shows a style picker only when there is more than one.
 */
export interface StyleDefinition {
  id: string;
  name: string;
  description: string;
}

export const styles = [
  {
    id: "macos",
    name: "macOS",
    description: "Today's macOS controls, light and without shadows",
  },
] as const satisfies StyleDefinition[];

export type StyleId = (typeof styles)[number]["id"];

export const accents = [
  { id: "blue", name: "Blue", color: "#2f7de0" },
  { id: "graphite", name: "Graphite", color: "#6b7a8f" },
  { id: "green", name: "Green", color: "#2f9e4f" },
  { id: "orange", name: "Orange", color: "#e57c1f" },
  { id: "pink", name: "Pink", color: "#d9457c" },
  { id: "purple", name: "Purple", color: "#8a56d6" },
] as const;

export type AccentId = (typeof accents)[number]["id"];

export const defaultStyle: StyleId = "macos";
export const defaultAccent: AccentId = "blue";

export const styleById = (id: string) => styles.find((s) => s.id === id) ?? styles[0];
