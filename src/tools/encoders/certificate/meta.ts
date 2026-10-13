import { ShieldCheck } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "certificate",
  name: "Certificate Decoder",
  description: "Inspect X.509 PEM certificates and chains",
  category: "encoders",
  icon: ShieldCheck,
  keywords: ["x509", "ssl", "tls", "pem", "cert", "fingerprint", "san"],
});
