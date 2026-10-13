import { Languages } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "unicode-inspector",
  name: "Unicode Inspector",
  description: "Code points, UTF-8 and UTF-16 of every character, and back to text",
  category: "encoders",
  icon: Languages,
  keywords: ["unicode", "code point", "utf8", "utf16", "emoji", "hex", "escape", "U+"],
});
