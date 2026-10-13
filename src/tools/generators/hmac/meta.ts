import { KeySquare } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "hmac",
  name: "HMAC",
  description: "Keyed hashes with SHA-1, SHA-256, SHA-384 and SHA-512",
  category: "generators",
  icon: KeySquare,
  keywords: ["hmac", "signature", "sha256", "mac", "webhook"],
});
