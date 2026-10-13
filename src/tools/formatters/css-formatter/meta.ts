import { Palette } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "css-formatter",
  name: "CSS Formatter",
  description: "Beautify or minify CSS, SCSS and Less",
  category: "formatters",
  icon: Palette,
  keywords: ["stylesheet", "scss", "less", "minify", "beautify"],
});
