import { MonitorSmartphone } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "user-agent",
  name: "User Agent Parser",
  description: "Browser, engine, OS and device from a user agent string",
  category: "utilities",
  icon: MonitorSmartphone,
  keywords: ["user agent", "ua", "browser", "device", "parse"],
});
