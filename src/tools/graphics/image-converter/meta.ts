import { ImagePlay } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "image-converter",
  name: "Image Converter",
  description: "Convert between PNG, JPEG, WebP, TIFF, GIF, BMP and ICO, and resize",
  category: "graphics",
  icon: ImagePlay,
  keywords: ["image", "convert", "resize", "png", "jpeg", "webp", "ico", "scale"],
});
