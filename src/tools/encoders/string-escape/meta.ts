import { Quote } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "string-escape",
  name: "String Escape",
  description: "Escape and unescape backslash sequences like \\n and \\u00e9",
  category: "encoders",
  icon: Quote,
  keywords: ["backslash", "unescape", "escape", "json string", "newline"],
});
