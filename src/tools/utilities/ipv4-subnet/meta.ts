import { Network } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "ipv4-subnet",
  name: "IPv4 Subnet Calculator",
  description: "Network, broadcast, mask and host range for a CIDR block",
  category: "utilities",
  icon: Network,
  keywords: ["cidr", "subnet", "netmask", "ip", "network", "prefix", "wildcard"],
});
