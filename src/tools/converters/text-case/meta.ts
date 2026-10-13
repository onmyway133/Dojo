import { CaseSensitive } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "text-case",
  name: "Text Case",
  description: "camelCase, snake_case, kebab-case, Title Case and more",
  category: "converters",
  icon: CaseSensitive,
  keywords: ["camel", "pascal", "snake", "kebab", "constant", "title", "upper", "lower", "naming"],
});
