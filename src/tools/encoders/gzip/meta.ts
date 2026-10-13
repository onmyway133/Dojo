import { FileArchive } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "gzip",
  name: "GZIP",
  description: "Compress text to Base64 GZIP and decompress it back",
  category: "encoders",
  icon: FileArchive,
  keywords: ["gzip", "deflate", "compress", "decompress", "zip"],
});
