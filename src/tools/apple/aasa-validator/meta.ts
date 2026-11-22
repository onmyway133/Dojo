import { Link2 } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "aasa-validator",
  name: "AASA Validator",
  description: "Check an apple-app-site-association file and test which URLs open your app",
  category: "apple",
  icon: Link2,
  keywords: ["apple-app-site-association", "universal links", "applinks", "associated domains", "webcredentials", "deep link", "ios"],
});
