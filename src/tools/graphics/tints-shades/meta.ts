import { Blend } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "tints-shades",
  name: "Tints & Shades",
  description: "Lighter and darker steps of a color, as CSS, SCSS or JSON",
  category: "graphics",
  icon: Blend,
  keywords: ["colour", "palette", "scale", "lighten", "darken", "tint", "shade", "oklch", "css variables"],
});
