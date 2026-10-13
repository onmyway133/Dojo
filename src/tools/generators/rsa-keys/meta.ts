import { KeyRound } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "rsa-keys",
  name: "RSA Key Pair",
  description: "Generate RSA private and public keys in PEM",
  category: "generators",
  icon: KeyRound,
  keywords: ["rsa", "keypair", "pem", "pkcs8", "public key", "private key"],
});
