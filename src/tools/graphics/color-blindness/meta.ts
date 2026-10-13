import { Eye } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "color-blindness",
  name: "Color Blindness Simulator",
  description: "See an image as people with color vision deficiencies do",
  category: "graphics",
  icon: Eye,
  keywords: ["color blind", "accessibility", "protanopia", "deuteranopia", "tritanopia", "a11y"],
});
