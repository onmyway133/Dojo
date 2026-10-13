import { Regex } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "regex-tester",
  name: "Regex Tester",
  description: "Test regular expressions with live highlighting and replace",
  category: "text",
  icon: Regex,
  keywords: ["regex", "regexp", "regular expression", "match", "replace", "pattern"],
});
