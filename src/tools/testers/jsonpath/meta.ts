import { Route } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "jsonpath",
  name: "JSONPath",
  description: "Query JSON with JSONPath expressions and see every match",
  category: "testers",
  icon: Route,
  keywords: ["jsonpath", "query", "json", "select", "filter", "jq"],
});
