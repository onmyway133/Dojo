import { GitCompare } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "json-diff",
  name: "JSON Diff",
  description: "Structural differences between two JSON documents",
  category: "testers",
  icon: GitCompare,
  keywords: ["json", "diff", "compare", "changes", "patch"],
});
