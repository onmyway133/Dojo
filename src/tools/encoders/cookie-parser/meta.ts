import { Cookie } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "cookie-parser",
  name: "Cookie Parser",
  description: "Parse Cookie and Set-Cookie headers into names, values and attributes",
  category: "encoders",
  icon: Cookie,
  keywords: ["cookie", "set-cookie", "header", "http", "session", "samesite", "httponly"],
});
