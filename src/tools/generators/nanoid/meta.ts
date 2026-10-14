import { Fingerprint } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "nanoid",
  name: "Nano ID",
  description: "Generate short, URL-safe random IDs with a custom size and alphabet",
  category: "generators",
  icon: Fingerprint,
  keywords: ["nanoid", "id", "short id", "random", "unique"],
});
