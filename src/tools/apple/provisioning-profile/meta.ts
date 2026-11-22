import { FileBadge } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "provisioning-profile",
  name: "Provisioning Profile",
  description: "Decode .mobileprovision files: devices, entitlements, certificates and expiry",
  category: "apple",
  icon: FileBadge,
  keywords: ["mobileprovision", "provisionprofile", "code signing", "entitlements", "udid", "ios", "xcode", "certificate"],
});
