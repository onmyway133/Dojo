import { Contrast } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "contrast-checker",
  name: "Contrast Checker",
  description: "WCAG contrast ratio of text and background colors, with AA and AAA checks",
  category: "graphics",
  icon: Contrast,
  keywords: ["colour", "wcag", "a11y", "accessibility", "contrast ratio", "aa", "aaa", "legibility"],
});
