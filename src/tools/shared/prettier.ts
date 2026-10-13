import type { Plugin } from "prettier";
import type { Choice } from "@/components/tool";

export type PrettierParser = "babel" | "typescript" | "html" | "vue" | "css" | "scss" | "less" | "graphql" | "markdown" | "yaml";

// Plugins load on demand so prettier only lands in the bundle of tools that use it.
const pluginLoaders: Record<string, () => Promise<Plugin>> = {
  babel: () => import("prettier/plugins/babel"),
  estree: () => import("prettier/plugins/estree") as Promise<Plugin>,
  typescript: () => import("prettier/plugins/typescript"),
  html: () => import("prettier/plugins/html"),
  postcss: () => import("prettier/plugins/postcss"),
  graphql: () => import("prettier/plugins/graphql"),
  markdown: () => import("prettier/plugins/markdown"),
  yaml: () => import("prettier/plugins/yaml"),
};

const pluginsFor: Record<PrettierParser, string[]> = {
  babel: ["babel", "estree"],
  typescript: ["typescript", "estree"],
  // HTML can embed scripts and styles.
  html: ["html", "babel", "estree", "postcss"],
  vue: ["html", "babel", "estree", "postcss", "typescript"],
  css: ["postcss"],
  scss: ["postcss"],
  less: ["postcss"],
  graphql: ["graphql"],
  markdown: ["markdown"],
  yaml: ["yaml"],
};

export interface PrettierOptions {
  printWidth?: number;
  tabWidth?: number;
  useTabs?: boolean;
  semi?: boolean;
  singleQuote?: boolean;
}

export async function prettierFormat(code: string, parser: PrettierParser, options: PrettierOptions = {}) {
  const [prettier, plugins] = await Promise.all([
    import("prettier/standalone"),
    Promise.all(pluginsFor[parser].map((name) => pluginLoaders[name]())),
  ]);
  return prettier.format(code, { parser, plugins, ...options });
}

export type PrintWidth = "80" | "100" | "120";

export const printWidthChoices: Choice<PrintWidth>[] = [
  { value: "80", label: "80" },
  { value: "100", label: "100" },
  { value: "120", label: "120" },
];
