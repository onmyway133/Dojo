import { Database } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "sql-formatter",
  name: "SQL Formatter",
  description: "Format SQL queries for PostgreSQL, MySQL, SQLite and more",
  category: "formatters",
  icon: Database,
  keywords: ["query", "postgres", "mysql", "sqlite", "beautify"],
});
