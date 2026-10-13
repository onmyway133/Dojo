import { ListOrdered } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "ulid",
  name: "ULID",
  description: "Generate sortable ULIDs and read their timestamps",
  category: "generators",
  icon: ListOrdered,
  keywords: ["ulid", "sortable", "identifier", "id"],
});
