import { Pilcrow } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "lorem-ipsum",
  name: "Lorem Ipsum",
  description: "Placeholder words, sentences and paragraphs",
  category: "generators",
  icon: Pilcrow,
  keywords: ["lorem", "ipsum", "placeholder", "dummy text", "filler"],
});
