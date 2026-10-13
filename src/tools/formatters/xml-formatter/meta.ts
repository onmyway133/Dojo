import { Code } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "xml-formatter",
  name: "XML Formatter",
  description: "Pretty print or minify XML and plist files",
  category: "formatters",
  icon: Code,
  keywords: ["plist", "svg", "beautify", "minify"],
});
