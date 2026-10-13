import { FileSliders } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "json-toml",
  name: "JSON ⇄ TOML",
  description: "Convert JSON to TOML and back, keeping key order",
  category: "converters",
  icon: FileSliders,
  keywords: ["toml", "cargo", "config", "convert"],
});
