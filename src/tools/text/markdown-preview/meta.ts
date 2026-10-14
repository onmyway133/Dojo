import { FileText } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "markdown-preview",
  name: "Markdown Preview",
  description: "Write Markdown and see it rendered, copy the HTML",
  category: "text",
  icon: FileText,
  keywords: ["markdown", "md", "preview", "gfm", "readme", "html", "mermaid", "diagram", "flowchart"],
});
