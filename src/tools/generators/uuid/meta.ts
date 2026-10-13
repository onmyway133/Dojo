import { Fingerprint } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "uuid",
  name: "UUID",
  description: "Generate v4 and v7 UUIDs and inspect existing ones",
  category: "generators",
  icon: Fingerprint,
  keywords: ["guid", "uuid", "v4", "v7", "identifier"],
});
