import { FileText } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "base64-text",
  name: "Base64 Text",
  description: "Encode and decode Base64, including URL-safe",
  category: "encoders",
  icon: FileText,
  keywords: ["base64", "encode", "decode", "btoa", "atob", "base64url"],
});
