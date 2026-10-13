import { AppWindowMac } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "html-preview",
  name: "HTML Preview",
  description: "Write HTML and CSS and see it rendered live",
  category: "text",
  icon: AppWindowMac,
  keywords: ["html", "viewer", "render", "preview", "playground", "css"],
});
