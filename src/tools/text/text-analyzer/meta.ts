import { ChartColumn } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "text-analyzer",
  name: "Text Analyzer",
  description: "Count characters, words, lines and reading time",
  category: "text",
  icon: ChartColumn,
  keywords: ["word count", "characters", "count", "statistics", "reading time"],
});
