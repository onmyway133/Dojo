import { Sheet } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "json-csv",
  name: "JSON ⇄ CSV",
  description: "Turn a JSON array into CSV or a table, and CSV back into JSON",
  category: "converters",
  icon: Sheet,
  keywords: ["table", "spreadsheet", "tsv", "excel", "convert"],
});
