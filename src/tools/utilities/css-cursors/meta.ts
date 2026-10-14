import { MousePointer2 } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "css-cursors",
  name: "CSS Cursors",
  description: "Every CSS cursor value, hover to preview and click to copy",
  category: "utilities",
  icon: MousePointer2,
  keywords: ["cursor", "mouse", "pointer", "css", "reference", "grab", "resize"],
});
