import { FileCode2 } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "js-formatter",
  name: "JavaScript Formatter",
  description: "Format JavaScript, TypeScript and JSX with Prettier",
  category: "formatters",
  icon: FileCode2,
  keywords: ["js", "ts", "typescript", "jsx", "tsx", "prettier", "beautify"],
});
