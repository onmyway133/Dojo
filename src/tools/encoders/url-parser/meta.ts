import { Globe } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "url-parser",
  name: "URL Parser",
  description: "Split a URL into parts and edit its query parameters",
  category: "encoders",
  icon: Globe,
  keywords: ["url", "query", "params", "querystring", "host", "path"],
});
