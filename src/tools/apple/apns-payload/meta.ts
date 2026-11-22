import { BellRing } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "apns-payload",
  name: "APNs Payload Builder",
  description: "Build push notification payloads with the 4 KB size check and a curl command",
  category: "apple",
  icon: BellRing,
  keywords: ["push notification", "apns", "aps", "remote notification", "silent push", "voip", "curl", "ios"],
});
