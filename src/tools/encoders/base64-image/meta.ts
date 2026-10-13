import { ImageUp } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "base64-image",
  name: "Base64 Image",
  description: "Turn images into data URIs and Base64 back into images",
  category: "encoders",
  icon: ImageUp,
  keywords: ["data uri", "base64", "image", "embed", "img"],
});
