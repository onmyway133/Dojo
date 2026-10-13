import { AppWindow } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "app-icon",
  name: "App Icon Set",
  description: "Turn one image into a macOS and iOS AppIcon.appiconset",
  category: "generators",
  icon: AppWindow,
  keywords: ["app icon", "appiconset", "xcode", "asset catalog", "icns", "ios", "macos"],
});
