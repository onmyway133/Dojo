import { FileCode } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "html-formatter",
  name: "HTML Formatter",
  description: "Beautify HTML, including embedded CSS and scripts",
  category: "formatters",
  icon: FileCode,
  keywords: ["markup", "beautify", "prettier", "vue"],
});
