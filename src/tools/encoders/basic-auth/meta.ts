import { KeySquare } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "basic-auth",
  name: "Basic Auth Header",
  description: "Build and decode HTTP Basic Authorization headers",
  category: "encoders",
  icon: KeySquare,
  keywords: ["authorization", "http", "header", "credentials", "base64", "curl"],
});
