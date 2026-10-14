import { ToggleRight } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "text-binary",
  name: "Text ⇄ Binary",
  description: "Convert UTF-8 text to binary bytes and back",
  category: "encoders",
  icon: ToggleRight,
  keywords: ["binary", "bits", "ascii", "bytes", "01"],
});
