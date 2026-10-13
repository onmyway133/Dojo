import { Braces } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "json-formatter",
  name: "JSON Formatter",
  description: "Beautify, minify and validate JSON",
  category: "formatters",
  icon: Braces,
  keywords: ["beautify", "prettify", "minify", "validate", "lint"],
});
