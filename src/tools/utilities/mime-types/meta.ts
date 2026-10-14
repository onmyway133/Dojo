import { FileType } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "mime-types",
  name: "MIME Types",
  description: "Look up the media type for a file extension, and the other way round",
  category: "utilities",
  icon: FileType,
  keywords: ["mime", "content-type", "media type", "extension", "file type"],
});
