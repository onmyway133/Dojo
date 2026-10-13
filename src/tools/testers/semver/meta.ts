import { Tag } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "semver",
  name: "Semver",
  description: "Compare versions, test ranges and bump numbers",
  category: "testers",
  icon: Tag,
  keywords: ["semver", "version", "range", "npm", "compare", "bump"],
});
