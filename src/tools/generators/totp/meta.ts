import { ShieldCheck } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "totp",
  name: "TOTP Codes",
  description: "Generate one-time codes from a 2FA secret, with an otpauth QR code",
  category: "generators",
  icon: ShieldCheck,
  keywords: ["otp", "2fa", "mfa", "authenticator", "hotp", "rfc 6238", "two factor", "otpauth"],
});
