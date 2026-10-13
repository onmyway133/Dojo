import { FileType2 } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "json-to-code",
  name: "JSON to Code",
  description: "Generate Swift, TypeScript, Kotlin, Go and more types from JSON",
  category: "converters",
  icon: FileType2,
  keywords: ["quicktype", "model", "codable", "struct", "interface", "generate", "types"],
});
