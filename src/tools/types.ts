import type { LucideIcon } from "lucide-react";

export type CategoryId =
  | "formatters"
  | "converters"
  | "encoders"
  | "generators"
  | "text"
  | "testers"
  | "graphics"
  | "utilities";

export interface Category {
  id: CategoryId;
  name: string;
  icon: LucideIcon;
}

export interface ToolMeta {
  /** Stable id, also the route segment and the folder name. */
  id: string;
  name: string;
  /** One line shown under the title and on the home card. */
  description: string;
  category: CategoryId;
  icon: LucideIcon;
  /** Extra search terms that don't appear in the name or description. */
  keywords?: string[];
}

/** Identity helper so tool folders get type checking and autocompletion. */
export function defineTool(meta: ToolMeta): ToolMeta {
  return meta;
}
