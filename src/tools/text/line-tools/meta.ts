import { ArrowDownAZ } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "line-tools",
  name: "Line Tools",
  description: "Sort, dedupe, reverse, trim and prefix lines",
  category: "text",
  icon: ArrowDownAZ,
  keywords: ["sort", "unique", "dedupe", "lines", "reverse", "trim", "prefix"],
});
