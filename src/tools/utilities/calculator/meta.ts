import { Calculator } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "calculator",
  name: "Calculator",
  description: "Expressions with functions, units and variables",
  category: "utilities",
  icon: Calculator,
  keywords: ["math", "calculate", "expression", "units", "convert", "mathjs"],
});
