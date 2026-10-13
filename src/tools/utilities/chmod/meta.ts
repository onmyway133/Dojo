import { ShieldEllipsis } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "chmod",
  name: "Chmod Calculator",
  description: "Unix permissions between octal, symbolic and checkboxes",
  category: "utilities",
  icon: ShieldEllipsis,
  keywords: ["chmod", "permissions", "unix", "rwx", "755", "644", "octal"],
});
