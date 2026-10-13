import { BadgeCheck } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "json-schema",
  name: "JSON Schema Validator",
  description: "Validate JSON against a schema and list every error",
  category: "testers",
  icon: BadgeCheck,
  keywords: ["json schema", "validate", "ajv", "draft", "openapi"],
});
