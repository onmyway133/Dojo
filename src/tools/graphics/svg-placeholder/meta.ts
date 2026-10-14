import { ImagePlus } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "svg-placeholder",
  name: "SVG Placeholder",
  description: "Make placeholder images of any size as SVG, data URI or PNG",
  category: "graphics",
  icon: ImagePlus,
  keywords: ["placeholder", "dummy image", "mockup", "svg", "data uri"],
});
