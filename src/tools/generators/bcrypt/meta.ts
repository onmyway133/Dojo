import { LockKeyhole } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "bcrypt",
  name: "Bcrypt",
  description: "Hash passwords with bcrypt and check a password against a hash",
  category: "generators",
  icon: LockKeyhole,
  keywords: ["bcrypt", "password", "hash", "verify", "salt", "$2b$"],
});
