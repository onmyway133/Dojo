import { Fingerprint } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "macho-uuid",
  name: "Mach-O UUID",
  description: "Read the UUID of each architecture in a binary or dSYM to match crash logs",
  category: "apple",
  icon: Fingerprint,
  keywords: ["dsym", "dwarfdump", "lc_uuid", "crash", "symbolicate", "binary image", "build uuid", "arm64", "universal"],
});
