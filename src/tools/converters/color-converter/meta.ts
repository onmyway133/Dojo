import { Pipette } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "color-converter",
  name: "Color Converter",
  description: "HEX, RGB, HSL, OKLCH and SwiftUI colors, with contrast checks",
  category: "converters",
  icon: Pipette,
  keywords: ["colour", "picker", "hex", "rgb", "hsl", "oklch", "swiftui", "uicolor", "nscolor", "contrast", "wcag"],
});
