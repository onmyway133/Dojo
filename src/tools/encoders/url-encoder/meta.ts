import { Link } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "url-encoder",
  name: "URL Encode",
  description: "Percent-encode and decode URLs and query values",
  category: "encoders",
  icon: Link,
  keywords: ["percent", "encodeURIComponent", "query", "escape", "decode"],
});
