import { Timer } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "cron-parser",
  name: "Cron Parser",
  description: "Explain a cron expression and list its next runs",
  category: "converters",
  icon: Timer,
  keywords: ["crontab", "schedule", "job", "quartz"],
});
