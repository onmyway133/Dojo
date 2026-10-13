import { Globe2 } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "public-ip",
  name: "Public IP",
  description: "Your public address, its location and this Mac's local addresses",
  category: "utilities",
  icon: Globe2,
  keywords: ["ip", "address", "public ip", "what is my ip", "network", "location", "ipv6"],
});
