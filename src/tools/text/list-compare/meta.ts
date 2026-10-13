import { GitCompareArrows } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "list-compare",
  name: "List Compare",
  description: "Find items only in A, only in B, or in both",
  category: "text",
  icon: GitCompareArrows,
  keywords: ["list", "compare", "intersection", "difference", "union", "set"],
});
