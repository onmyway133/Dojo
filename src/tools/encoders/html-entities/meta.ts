import { Ampersand } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "html-entities",
  name: "HTML Entities",
  description: "Escape and unescape HTML entities",
  category: "encoders",
  icon: Ampersand,
  keywords: ["escape", "unescape", "html", "entity", "nbsp"],
});
