import { FileCode2 } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "plist-json",
  name: "Plist ⇄ JSON",
  description: "Convert property lists (XML or binary) to JSON and back",
  category: "apple",
  icon: FileCode2,
  keywords: ["plist", "info.plist", "property list", "bplist", "binary plist", "entitlements", "xml", "ios", "macos"],
});
