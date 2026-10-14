import { Link2 } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "slugify",
  name: "Slugify",
  description: "Turn titles into clean URL slugs, one per line",
  category: "text",
  icon: Link2,
  keywords: ["slug", "permalink", "url", "kebab", "diacritics"],
});
