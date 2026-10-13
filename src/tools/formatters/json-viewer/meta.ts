import { ListTree } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "json-viewer",
  name: "JSON Viewer",
  description: "Explore JSON as a collapsible tree and copy paths",
  category: "formatters",
  icon: ListTree,
  keywords: ["tree", "inspect", "explore", "path", "viewer"],
});
