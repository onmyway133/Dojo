import { Share2 } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "graphql-formatter",
  name: "GraphQL Formatter",
  description: "Format GraphQL queries and schemas",
  category: "formatters",
  icon: Share2,
  keywords: ["gql", "schema", "query", "prettier"],
});
