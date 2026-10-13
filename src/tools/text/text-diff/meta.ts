import { Diff } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "text-diff",
  name: "Text Diff",
  description: "Compare two texts side by side with inline changes",
  category: "text",
  icon: Diff,
  keywords: ["diff", "compare", "changes", "merge", "patch"],
});
