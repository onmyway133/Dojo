import { FileMinus2 } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "image-compressor",
  name: "Image Compressor",
  description: "Shrink PNG files losslessly and re-encode JPEGs",
  category: "graphics",
  icon: FileMinus2,
  keywords: ["compress", "optimize", "png", "jpeg", "oxipng", "shrink", "tinypng"],
});
