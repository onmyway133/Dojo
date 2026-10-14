import { Percent } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "percentage",
  name: "Percentage Calculator",
  description: "X% of Y, what percent X is of Y, and percent change",
  category: "utilities",
  icon: Percent,
  keywords: ["percent", "ratio", "increase", "decrease", "growth", "discount"],
});
