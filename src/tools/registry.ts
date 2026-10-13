import { type ComponentType, lazy, type LazyExoticComponent } from "react";
import { categories } from "./categories";
import type { Category, ToolMeta } from "./types";

// Every tool lives in tools/<category>/<id>/ with a meta.ts and a Tool.tsx.
// Metadata loads eagerly (it's tiny); views are code-split and load on first open.
const metaModules = import.meta.glob<{ meta: ToolMeta }>("./*/*/meta.ts", { eager: true });
const viewModules = import.meta.glob<{ default: ComponentType }>("./*/*/Tool.tsx");

const categoryOrder = new Map(categories.map((c, i) => [c.id, i]));

export const tools: ToolMeta[] = Object.values(metaModules)
  .map((m) => m.meta)
  .sort(
    (a, b) =>
      categoryOrder.get(a.category)! - categoryOrder.get(b.category)! ||
      a.name.localeCompare(b.name),
  );

const toolsById = new Map(tools.map((t) => [t.id, t]));

export function getTool(id: string | undefined): ToolMeta | undefined {
  return id ? toolsById.get(id) : undefined;
}

const viewLoaders = new Map(
  Object.entries(viewModules).map(([path, load]) => [path.split("/")[2], load]),
);
const viewCache = new Map<string, LazyExoticComponent<ComponentType>>();

/** The lazily loaded view for a tool, created once per tool so React keeps its state. */
export function getToolView(id: string): LazyExoticComponent<ComponentType> | undefined {
  const cached = viewCache.get(id);
  if (cached) return cached;
  const load = viewLoaders.get(id);
  if (!load) return undefined;
  const view = lazy(load);
  viewCache.set(id, view);
  return view;
}

export interface ToolGroup {
  category: Category;
  tools: ToolMeta[];
}

/** Groups tools by category in display order, skipping empty categories. */
export function groupByCategory(list: ToolMeta[]): ToolGroup[] {
  return categories
    .map((category) => ({ category, tools: list.filter((t) => t.category === category.id) }))
    .filter((g) => g.tools.length > 0);
}

/** Case-insensitive match on name, description and keywords; every word must match. */
export function searchTools(list: ToolMeta[], query: string): ToolMeta[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return list;
  return list.filter((t) => {
    const haystack = [t.name, t.description, t.id, ...(t.keywords ?? [])].join(" ").toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}
