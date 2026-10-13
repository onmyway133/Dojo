import { ServerCog } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "http-status",
  name: "HTTP Status Codes",
  description: "Every HTTP status code with what it means",
  category: "utilities",
  icon: ServerCog,
  keywords: ["http", "status", "404", "500", "response", "code", "rest"],
});
