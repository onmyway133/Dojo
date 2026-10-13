import { Lock } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "password",
  name: "Password",
  description: "Strong random passwords with an entropy estimate",
  category: "generators",
  icon: Lock,
  keywords: ["password", "secret", "passphrase", "random", "strong"],
});
