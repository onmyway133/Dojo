import { FileCheck2 } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "file-checksum",
  name: "File Checksum",
  description: "Hash any file and compare it with an expected checksum",
  category: "generators",
  icon: FileCheck2,
  keywords: ["checksum", "md5", "sha256", "verify", "file", "hash", "integrity"],
});
