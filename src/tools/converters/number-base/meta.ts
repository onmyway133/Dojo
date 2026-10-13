import { Binary } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "number-base",
  name: "Number Base",
  description: "Convert between binary, octal, decimal, hex and any base",
  category: "converters",
  icon: Binary,
  keywords: ["radix", "hex", "binary", "octal", "decimal", "base64"],
});
