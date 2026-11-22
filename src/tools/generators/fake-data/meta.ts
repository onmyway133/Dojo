import { DatabaseZap } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "fake-data",
  name: "Fake Data Generator",
  description: "Generate mock rows as JSON, CSV or SQL inserts",
  category: "generators",
  icon: DatabaseZap,
  keywords: ["mock", "mockaroo", "faker", "test data", "seed", "dummy", "sql insert", "csv", "json"],
});
