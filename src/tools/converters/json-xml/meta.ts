import { FileCode2 } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "json-xml",
  name: "JSON ⇄ XML",
  description: "Convert JSON to XML and back, attributes included",
  category: "converters",
  icon: FileCode2,
  keywords: ["xml", "json", "convert", "soap", "plist", "attributes"],
});
