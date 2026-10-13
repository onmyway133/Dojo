import { FileCog } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "yaml-formatter",
  name: "YAML Formatter",
  description: "Validate and re-indent YAML documents",
  category: "formatters",
  icon: FileCog,
  keywords: ["yml", "lint", "validate", "kubernetes", "docker compose"],
});
