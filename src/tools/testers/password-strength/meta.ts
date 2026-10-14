import { Gauge } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "password-strength",
  name: "Password Strength",
  description: "Estimate entropy and guessing time for a password, entirely offline",
  category: "testers",
  icon: Gauge,
  keywords: ["password", "entropy", "crack", "strength", "security", "brute force"],
});
