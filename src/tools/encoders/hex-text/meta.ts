import { Binary } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "hex-text",
  name: "Text ⇄ Hex",
  description: "Convert UTF-8 text to hex bytes and back",
  category: "encoders",
  icon: Binary,
  keywords: ["hex", "bytes", "hexdump", "utf8"],
});
