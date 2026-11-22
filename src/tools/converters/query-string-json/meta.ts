import { FileJson } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "query-string-json",
  name: "Query String ⇄ JSON",
  description: "Turn URL query parameters into JSON and back",
  category: "converters",
  icon: FileJson,
  keywords: ["url", "search params", "querystring", "form data", "urlencoded", "parameters"],
});
