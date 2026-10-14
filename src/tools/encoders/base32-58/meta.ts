import { FileDigit } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "base32-58",
  name: "Base32 & Base58",
  description: "Encode and decode text as Base32 (RFC 4648) or Base58",
  category: "encoders",
  icon: FileDigit,
  keywords: ["base32", "base58", "bitcoin", "rfc 4648", "encode", "decode", "totp secret"],
});
