import { Landmark } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "roman-numerals",
  name: "Roman Numerals",
  description: "Convert numbers to Roman numerals and back",
  category: "converters",
  icon: Landmark,
  keywords: ["roman", "numeral", "mcmxc", "number"],
});
