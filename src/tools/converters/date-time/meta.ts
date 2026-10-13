import { CalendarClock } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "date-time",
  name: "Date & Timestamp",
  description: "Convert Unix timestamps, ISO 8601 and custom date formats",
  category: "converters",
  icon: CalendarClock,
  keywords: ["unix", "epoch", "timestamp", "iso8601", "rfc2822", "timezone", "date format", "time"],
});
