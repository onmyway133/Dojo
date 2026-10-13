import { ArrowLeftRight } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "json-yaml",
  name: "JSON ⇄ YAML",
  description: "Convert JSON to YAML and back",
  category: "converters",
  icon: ArrowLeftRight,
  keywords: ["yml", "convert", "json to yaml", "yaml to json"],
});
