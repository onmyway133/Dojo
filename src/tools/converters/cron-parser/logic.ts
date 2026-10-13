import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue";

export interface CronInfo {
  description: string;
  next: Date[];
  fields: { name: string; value: string }[];
}

const fieldNames5 = ["Minute", "Hour", "Day of month", "Month", "Day of week"];
const fieldNames6 = ["Second", ...fieldNames5];

/** Describes a 5 or 6 field cron expression and computes upcoming runs. */
export function describeCron(expression: string, count: number, from = new Date()): CronInfo {
  const trimmed = expression.trim().replace(/\s+/g, " ");
  const description = cronstrue.toString(trimmed, { use24HourTimeFormat: true, throwExceptionOnParseError: true });
  const next = CronExpressionParser.parse(trimmed, { currentDate: from })
    .take(count)
    .map((d) => d.toDate());
  const parts = trimmed.split(" ");
  const names = parts.length === 6 ? fieldNames6 : fieldNames5;
  return { description, next, fields: names.map((name, i) => ({ name, value: parts[i] ?? "" })) };
}

export const cronPresets = [
  { label: "Every minute", expression: "* * * * *" },
  { label: "Every 15 minutes", expression: "*/15 * * * *" },
  { label: "Hourly", expression: "0 * * * *" },
  { label: "Daily at midnight", expression: "0 0 * * *" },
  { label: "Weekdays at 9:00", expression: "0 9 * * 1-5" },
  { label: "Weekly on Sunday", expression: "0 0 * * 0" },
  { label: "Monthly on the 1st", expression: "0 0 1 * *" },
];
