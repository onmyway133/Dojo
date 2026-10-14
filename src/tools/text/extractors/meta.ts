import { TextSearch } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "extractors",
  name: "Text Extractors",
  description: "Pull emails, URLs, IP addresses, numbers and colors out of any text",
  category: "text",
  icon: TextSearch,
  keywords: ["extract", "find", "scrape", "email", "url", "link", "ip", "ipv6", "hashtag", "mention", "hex"],
});
