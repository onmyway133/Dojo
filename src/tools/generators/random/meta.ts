import { Dices } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "random",
  name: "Random",
  description: "Random numbers, strings and shuffled lists",
  category: "generators",
  icon: Dices,
  keywords: ["random", "number", "dice", "shuffle", "string", "pick"],
});
