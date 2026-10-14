import { Palette } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "color-harmonies",
  name: "Color Harmonies",
  description: "Complementary, analogous, triadic and other palettes from one color",
  category: "graphics",
  icon: Palette,
  keywords: ["colour", "palette", "color wheel", "complementary", "analogous", "triadic", "tetradic", "scheme"],
});
