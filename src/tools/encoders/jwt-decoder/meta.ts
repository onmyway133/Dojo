import { KeyRound } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "jwt-decoder",
  name: "JWT Decoder",
  description: "Decode JSON Web Tokens, check expiry and verify HMAC signatures",
  category: "encoders",
  icon: KeyRound,
  keywords: ["jwt", "token", "jws", "bearer", "claims", "oauth"],
});
